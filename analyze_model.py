from bingo_ml import BingoAI, BingoEnvironment
import numpy as np
from collections import defaultdict
import matplotlib.pyplot as plt
from tqdm import tqdm

def analyze_performance(num_games=1000):
    ai = BingoAI()
    env = BingoEnvironment()
    
    # Performance metrics
    metrics = {
        'total_lines': [],  # Track lines for each game
        'wins': 0,
        'lines_distribution': defaultdict(int),
        'move_positions': defaultdict(int),  # Track which positions are chosen
        'first_moves': defaultdict(int),     # Track first moves
        'board_states': [],                  # Track final board states
        'avg_moves_to_line': []             # Track how many moves to complete first line
    }
    
    print("\nAnalyzing model performance over 1000 games...")
    for game in tqdm(range(num_games)):
        state = env.reset()
        done = False
        moves_sequence = []
        moves_to_first_line = 0
        found_first_line = False
        
        while not done:
            # Simulate random player move
            valid_moves = env.get_valid_moves()
            player_move = np.random.choice(valid_moves)
            
            # Get AI's move
            valid_moves = list(set(valid_moves) - {player_move})
            auto_move = ai.get_action(state, valid_moves)
            
            # Track moves
            moves_sequence.append(auto_move)
            if len(moves_sequence) == 1:
                metrics['first_moves'][auto_move] += 1
            
            metrics['move_positions'][auto_move] += 1
            
            next_state, reward, done = env.step(player_move, auto_move)
            
            # Check for first completed line
            if not found_first_line:
                moves_to_first_line += 1
                if env._count_completed_lines() > 0:
                    found_first_line = True
                    metrics['avg_moves_to_line'].append(moves_to_first_line)
            
            state = next_state
            
            if done:
                lines = env._count_completed_lines()
                metrics['total_lines'].append(lines)
                metrics['wins'] += 1 if lines > 0 else 0
                metrics['lines_distribution'][lines] += 1
                metrics['board_states'].append(env.board.copy())
    
    # Calculate statistics
    avg_lines = np.mean(metrics['total_lines'])
    win_rate = (metrics['wins'] / num_games) * 100
    std_lines = np.std(metrics['total_lines'])
    avg_moves_to_line = np.mean(metrics['avg_moves_to_line']) if metrics['avg_moves_to_line'] else 0
    
    # Print analysis
    print("\nPerformance Analysis:")
    print(f"Average Lines Completed: {avg_lines:.2f} ± {std_lines:.2f}")
    print(f"Win Rate: {win_rate:.2f}%")
    print(f"Average Moves to First Line: {avg_moves_to_line:.2f}")
    
    print("\nLines Distribution:")
    for lines, count in sorted(metrics['lines_distribution'].items()):
        print(f"{lines} lines: {count/num_games*100:.1f}%")
    
    # Plot analysis
    plt.figure(figsize=(15, 10))
    
    # Plot lines distribution
    plt.subplot(2, 2, 1)
    lines, counts = zip(*sorted(metrics['lines_distribution'].items()))
    plt.bar(lines, [c/num_games*100 for c in counts])
    plt.title('Lines Distribution')
    plt.xlabel('Number of Lines')
    plt.ylabel('Percentage of Games')
    
    # Plot move position heatmap
    plt.subplot(2, 2, 2)
    heatmap = np.zeros((5, 5))
    for pos, count in metrics['move_positions'].items():
        row, col = pos // 5, pos % 5
        heatmap[row, col] = count
    plt.imshow(heatmap, cmap='hot')
    plt.colorbar()
    plt.title('Move Position Heatmap')
    
    # Plot first move distribution
    plt.subplot(2, 2, 3)
    first_moves = np.zeros((5, 5))
    for pos, count in metrics['first_moves'].items():
        row, col = pos // 5, pos % 5
        first_moves[row, col] = count
    plt.imshow(first_moves, cmap='hot')
    plt.colorbar()
    plt.title('First Move Distribution')
    
    # Plot lines per game
    plt.subplot(2, 2, 4)
    plt.plot(metrics['total_lines'])
    plt.title('Lines Completed per Game')
    plt.xlabel('Game Number')
    plt.ylabel('Number of Lines')
    
    plt.tight_layout()
    plt.savefig('performance_analysis.png')
    plt.close()

if __name__ == "__main__":
    analyze_performance() 