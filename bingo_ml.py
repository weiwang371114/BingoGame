import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from collections import deque, defaultdict
import random
import json
import matplotlib.pyplot as plt
from tqdm import tqdm
import heapq
import argparse
import os
from torch.serialization import safe_globals, add_safe_globals

# Add numpy array reconstruction to safe globals
add_safe_globals(['numpy._core.multiarray._reconstruct'])

class PrioritizedReplayBuffer:
    def __init__(self, maxlen=50000, alpha=0.6, beta=0.4):
        self.maxlen = maxlen
        self.buffer = []
        self.priorities = []
        self.alpha = alpha  # Priority exponent
        self.beta = beta    # Importance sampling exponent
        self.eps = 1e-6    # Small constant to prevent zero priorities
        
    def add(self, experience, priority=None):
        if priority is None:
            priority = max(self.priorities) if self.priorities else 1.0
            
        if len(self.buffer) >= self.maxlen:
            self.buffer.pop(0)
            self.priorities.pop(0)
            
        self.buffer.append(experience)
        self.priorities.append(priority)
        
    def sample(self, batch_size):
        if len(self.buffer) == 0:
            return [], [], []
            
        # Convert priorities to probabilities
        probs = np.array(self.priorities) ** self.alpha
        probs /= probs.sum()
        
        # Sample indices based on priorities
        indices = np.random.choice(len(self.buffer), batch_size, p=probs)
        
        # Calculate importance sampling weights
        weights = (len(self.buffer) * probs[indices]) ** (-self.beta)
        weights /= weights.max()
        
        samples = [self.buffer[idx] for idx in indices]
        return samples, indices, weights
        
    def update_priorities(self, indices, priorities):
        for idx, priority in zip(indices, priorities):
            self.priorities[idx] = priority + self.eps
            
    def __len__(self):
        return len(self.buffer)

class BingoEnvironment:
    def __init__(self):
        self.board = np.zeros((5, 5))
        self.moves_made = 0
        self.max_moves = 16  # 8 player moves + 8 random moves
        
    def reset(self):
        self.board = np.zeros((5, 5))
        self.moves_made = 0
        return self.board.flatten()
    
    def step(self, player_move, auto_move):
        """
        Execute both player move and auto move, then calculate reward based on final state
        """
        # Player move
        player_row, player_col = player_move // 5, player_move % 5
        if self.board[player_row, player_col] != 0:
            return self.board.flatten(), -10, True  # Invalid move penalty
        self.board[player_row, player_col] = 1
        self.moves_made += 1
        
        # Auto move (random cell)
        auto_row, auto_col = auto_move // 5, auto_move % 5
        self.board[auto_row, auto_col] = 1
        self.moves_made += 1
        
        # Check if game is over
        done = self.moves_made >= self.max_moves
        
        # Calculate reward based on completed lines after both moves
        reward = 0
        if done:
            lines = self._count_completed_lines()
            # Reward structure
            if lines >= 5:
                reward = 100  # Exceptional performance
            elif lines >= 4:
                reward = 30   # Very good performance
            elif lines >= 3:
                reward = 5    # Good performance
            else:
                reward = lines  # Base reward for 1-2 lines
        else:
            # Small intermediate reward based on potential lines
            reward = self._evaluate_potential_lines() * 0.1
        
        return self.board.flatten(), reward, done
    
    def _count_completed_lines(self):
        """Count number of completed lines (rows, columns, diagonals)"""
        lines = 0
        # Check rows
        for i in range(5):
            if np.all(self.board[i, :] == 1):
                lines += 1
        
        # Check columns
        for i in range(5):
            if np.all(self.board[:, i] == 1):
                lines += 1
        
        # Check main diagonal
        if np.all(np.diag(self.board) == 1):
            lines += 1
        
        # Check anti-diagonal
        if np.all(np.diag(np.fliplr(self.board)) == 1):
            lines += 1
        
        return lines
    
    def _evaluate_potential_lines(self):
        """Evaluate potential for completing lines"""
        potential = 0
        
        # Helper function to evaluate a line
        def evaluate_line(line):
            filled = np.sum(line == 1)
            if filled == 4:  # One cell away from completion
                return 2.0
            elif filled == 3:  # Two cells away from completion
                return 1.0
            elif filled == 2:  # Three cells away from completion
                return 0.5
            return 0
        
        # Check rows
        for i in range(5):
            potential += evaluate_line(self.board[i, :])
        
        # Check columns
        for i in range(5):
            potential += evaluate_line(self.board[:, i])
        
        # Check main diagonal
        potential += evaluate_line(np.diag(self.board))
        
        # Check anti-diagonal
        potential += evaluate_line(np.diag(np.fliplr(self.board)))
        
        return potential
    
    def get_valid_moves(self):
        """Return list of valid moves (empty cells)"""
        return [i for i in range(25) if self.board[i // 5, i % 5] == 0]

class DQN(nn.Module):
    def __init__(self):
        super(DQN, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(25, 256),
            nn.ReLU(),
            nn.Linear(256, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 25)
        )
    
    def forward(self, x):
        return self.network(x)

class BingoAI:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = DQN().to(self.device)
        self.target_model = DQN().to(self.device)
        self.target_model.load_state_dict(self.model.state_dict())
        
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.0005)
        self.memory = PrioritizedReplayBuffer(maxlen=100000)
        
        self.batch_size = 128
        self.gamma = 0.99
        self.epsilon = 1.0
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.9997
        
        # Training state
        self.current_episode = 0
        self.best_reward = -float('inf')
        
    def save_checkpoint(self, episode, reward):
        """Save training state to resume later"""
        # Save memory buffer separately
        memory_data = {
            'buffer': self.memory.buffer,
            'priorities': self.memory.priorities,
            'maxlen': self.memory.maxlen,
            'alpha': self.memory.alpha,
            'beta': self.memory.beta,
            'eps': self.memory.eps
        }
        
        # Save model state
        checkpoint = {
            'episode': episode,
            'model_state_dict': self.model.state_dict(),
            'target_model_state_dict': self.target_model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'epsilon': self.epsilon,
            'best_reward': reward,
            'memory_data': memory_data
        }
        
        torch.save(checkpoint, 'bingo_model_latest.pth')
        if reward > self.best_reward:
            self.best_reward = reward
            torch.save(checkpoint, 'bingo_model_best.pth')
            
    def load_checkpoint(self, path='bingo_model_latest.pth'):
        """Load training state to resume training"""
        if not os.path.exists(path):
            print(f"No checkpoint found at {path}")
            return False
            
        print(f"Loading checkpoint from {path}")
        try:
            checkpoint = torch.load(path, map_location=self.device, weights_only=False)
        except Exception as e:
            print(f"Error loading checkpoint: {e}")
            return False
        
        try:
            self.current_episode = checkpoint['episode']
            self.model.load_state_dict(checkpoint['model_state_dict'])
            self.target_model.load_state_dict(checkpoint['target_model_state_dict'])
            self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
            self.epsilon = checkpoint['epsilon']
            self.best_reward = checkpoint['best_reward']
            
            # Reconstruct memory buffer
            memory_data = checkpoint['memory_data']
            self.memory = PrioritizedReplayBuffer(
                maxlen=memory_data['maxlen'],
                alpha=memory_data['alpha'],
                beta=memory_data['beta']
            )
            self.memory.buffer = memory_data['buffer']
            self.memory.priorities = memory_data['priorities']
            self.memory.eps = memory_data['eps']
            
            print(f"Successfully loaded checkpoint from episode {self.current_episode}")
            return True
        except Exception as e:
            print(f"Error reconstructing checkpoint data: {e}")
            return False
    
    def get_player_move(self, state, valid_moves):
        """
        Get the best move for the player using the trained model and smart heuristics.
        1. First move: Always pick center (when 25 moves available)
        2. Check for immediate line completion (when ≤ 6 moves left)
        3. Prefer intersecting cells (when 21 to 6 moves left)
        4. Fall back to model prediction or random exploration
        """
        board = state.reshape(5, 5)
        moves_left = len(valid_moves)
        
        # First move: Always pick center if available
        if moves_left == 25 and 12 in valid_moves:  # First move
            return 12  # Center position (2,2)
        
        # Last few moves: Check for immediate line completion
        if moves_left <= 6:  # Last 3 player moves
            best_move = self._find_line_completion_move(board, valid_moves)
            if best_move is not None:
                return best_move
        
        # Mid-game: Prefer intersecting cells if they exist
        if moves_left <= 21 and moves_left > 6:  # Mid-game moves
            intersect_move = self._find_best_intersection_move(board, valid_moves)
            if intersect_move is not None:
                # Still maintain some exploration
                if random.random() > 0.2:  # 80% chance to take the intersection move
                    return intersect_move
        
        # Early game or no good heuristic moves: Use model or random
        if random.random() < self.epsilon:
            return random.choice(valid_moves)
        
        state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
        with torch.no_grad():
            q_values = self.model(state_tensor)
        
        # Mask invalid moves
        mask = torch.ones(25) * float('-inf')
        mask[valid_moves] = 0
        q_values = q_values + mask.to(self.device)
        
        return q_values.argmax().item()
    
    def _find_line_completion_move(self, board, valid_moves):
        """Find a move that immediately completes a line"""
        for move in valid_moves:
            row, col = move // 5, move % 5
            
            # Check row
            row_sum = np.sum(board[row, :])
            if row_sum == 4:
                return move
            
            # Check column
            col_sum = np.sum(board[:, col])
            if col_sum == 4:
                return move
            
            # Check main diagonal
            if row == col:
                diag_sum = np.sum(np.diag(board))
                if diag_sum == 4:
                    return move
            
            # Check anti-diagonal
            if row + col == 4:
                anti_diag_sum = np.sum(np.diag(np.fliplr(board)))
                if anti_diag_sum == 4:
                    return move
        
        return None
    
    def _find_best_intersection_move(self, board, valid_moves):
        """Find move that intersects with most existing selections"""
        best_score = -1
        best_move = None
        
        for move in valid_moves:
            row, col = move // 5, move % 5
            score = 0
            
            # Count filled cells in same row
            score += np.sum(board[row, :])
            
            # Count filled cells in same column
            score += np.sum(board[:, col])
            
            # Check if on main diagonal
            if row == col:
                score += np.sum(np.diag(board))
            
            # Check if on anti-diagonal
            if row + col == 4:
                score += np.sum(np.diag(np.fliplr(board)))
            
            # Bonus for center and near-center positions in early game
            if (row in [1,2,3] and col in [1,2,3]):
                score += 0.5
            if row == 2 and col == 2:  # Center position
                score += 1.0
            
            if score > best_score:
                best_score = score
                best_move = move
        
        return best_move if best_score > 0 else None
    
    def get_auto_move(self, valid_moves):
        """
        Auto move is always random as per game rules.
        """
        return random.choice(valid_moves)
    
    def train(self, num_episodes=50000, resume=True):
        """Train the model with resume capability"""
        env = BingoEnvironment()
        start_episode = 0
        
        # Try to resume from checkpoint
        if resume:
            if self.load_checkpoint():
                start_episode = self.current_episode
                print(f"Resuming training from episode {start_episode}")
        
        print("\nStarting training...")
        try:
            progress_bar = tqdm(range(start_episode, num_episodes))
            for episode in progress_bar:
                state = env.reset()
                total_reward = 0
                episode_memory = []
                done = False
                
                while not done:
                    valid_moves = env.get_valid_moves()
                    player_move = self.get_player_move(state, valid_moves)
                    
                    valid_moves = list(set(valid_moves) - {player_move})
                    auto_move = self.get_auto_move(valid_moves)
                    
                    next_state, reward, done = env.step(player_move, auto_move)
                    
                    # Generate augmented experiences
                    augmented_experiences = self._augment_experience(
                        state, player_move, reward, next_state, done
                    )
                    
                    # Add all augmented experiences to episode memory
                    for exp in augmented_experiences:
                        episode_memory.append((exp, reward))
                    
                    state = next_state
                    total_reward += reward
                    
                    self._train_step()
                
                final_lines = env._count_completed_lines()
                
                # Calculate priority based on final lines achieved
                if final_lines >= 4:
                    priority = 10.0
                elif final_lines >= 3:
                    priority = 5.0
                elif final_lines >= 2:
                    priority = 2.0
                else:
                    priority = 1.0
                    
                for experience, step_reward in episode_memory:
                    self.memory.add(experience, priority * (1 + step_reward))
                
                self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)
                
                # Update progress bar
                progress_bar.set_description(
                    f"Reward: {total_reward:.1f}, Lines: {final_lines}, Epsilon: {self.epsilon:.3f}"
                )
                
                # Save checkpoint periodically
                if episode > 0 and episode % 100 == 0:  # Save more frequently
                    self.current_episode = episode
                    self.save_checkpoint(episode, total_reward)
                    
                # Evaluate periodically
                if episode > 0 and episode % 1000 == 0:
                    self.evaluate(100)
        
        except KeyboardInterrupt:
            print("\nTraining interrupted! Saving checkpoint...")
            self.current_episode = episode
            self.save_checkpoint(episode, total_reward)
            print("Checkpoint saved. You can resume training later.")
            return
        
        print("\nTraining completed!")
    
    def _train_step(self):
        if len(self.memory) < self.batch_size:
            return
            
        # Sample batch with priorities
        batch, indices, weights = self.memory.sample(self.batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        
        # Convert to tensors
        states = torch.FloatTensor(states).to(self.device)
        actions = torch.LongTensor(actions).to(self.device)
        rewards = torch.FloatTensor(rewards).to(self.device)
        next_states = torch.FloatTensor(next_states).to(self.device)
        dones = torch.FloatTensor(dones).to(self.device)
        
        # Compute current Q values
        current_q = self.model(states).gather(1, actions.unsqueeze(1))
        
        # Compute next Q values
        with torch.no_grad():
            next_q = self.target_model(next_states).max(1)[0]
        target_q = rewards + (1 - dones) * self.gamma * next_q
        
        # Compute loss with importance sampling weights
        td_error = (current_q.squeeze() - target_q).abs()
        weights = torch.FloatTensor(weights).to(self.device)
        loss = (td_error * weights).mean()
        
        # Update priorities in memory
        new_priorities = td_error.detach().cpu().numpy()
        self.memory.update_priorities(indices, new_priorities)
        
        # Optimize the model
        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
        self.optimizer.step()
        
        # Update target network
        self.target_model.load_state_dict(self.model.state_dict())
        
    def evaluate(self, num_games=100):
        """Evaluate the model's performance"""
        env = BingoEnvironment()
        lines_achieved = []
        
        for _ in range(num_games):
            state = env.reset()
            done = False
            while not done:
                valid_moves = env.get_valid_moves()
                # Use model for player moves
                player_move = self.get_player_move(state, valid_moves)
                valid_moves = list(set(valid_moves) - {player_move})
                # Random auto move
                auto_move = self.get_auto_move(valid_moves)
                state, _, done = env.step(player_move, auto_move)
            
            lines = env._count_completed_lines()
            lines_achieved.append(lines)
        
        avg_lines = np.mean(lines_achieved)
        max_lines = max(lines_achieved)
        print(f"\nEvaluation - Avg Lines: {avg_lines:.2f}, Max Lines: {max_lines}")
        return avg_lines, max_lines

    def _transform_move(self, move, transform_type, k=1):
        """Transform a move according to board rotation or flip"""
        row, col = move // 5, move % 5
        if transform_type == 'rotate':
            for _ in range(k):
                row, col = col, 4 - row
        elif transform_type == 'flip':
            col = 4 - col
        return row * 5 + col
    
    def _augment_experience(self, state, move, reward, next_state, done):
        """Generate augmented experiences through rotations and flips"""
        experiences = [(state, move, reward, next_state, done)]
        board = state.reshape(5, 5)
        next_board = next_state.reshape(5, 5)
        
        # Generate rotations (90, 180, 270 degrees)
        for k in range(1, 4):
            rotated_board = np.rot90(board, k)
            rotated_next_board = np.rot90(next_board, k)
            rotated_move = self._transform_move(move, 'rotate', k)
            experiences.append((
                rotated_board.flatten(),
                rotated_move,
                reward,
                rotated_next_board.flatten(),
                done
            ))
        
        # Generate horizontal flip
        flipped_board = np.fliplr(board)
        flipped_next_board = np.fliplr(next_board)
        flipped_move = self._transform_move(move, 'flip')
        experiences.append((
            flipped_board.flatten(),
            flipped_move,
            reward,
            flipped_next_board.flatten(),
            done
        ))
        
        return experiences

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Train Bingo AI')
    parser.add_argument('--resume', action='store_true', help='Resume training from checkpoint')
    parser.add_argument('--episodes', type=int, default=50000, help='Number of episodes to train')
    args = parser.parse_args()
    
    ai = BingoAI()
    ai.train(num_episodes=args.episodes, resume=args.resume) 