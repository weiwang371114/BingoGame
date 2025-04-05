import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass
from tqdm import tqdm
from solver import BingoSolver
import random
from collections import Counter

@dataclass
class GameResult:
    completed_lines: int
    moves: List[int]
    final_board: set
    scores: List[Dict[str, float]]
    pattern_matches: List[Dict]  # New field to track pattern matches

def run_game(_: int = 0) -> GameResult:
    """Function to run a single game for multiprocessing
    
    Args:
        _: Unused argument required for multiprocessing
    """
    board_state = set()
    moves = []
    scores = []
    pattern_matches = []  # Track pattern matches during the game
    
    while len(board_state) < 16:
        # Player's move using the solver
        solver = BingoSolver(board_state)
        
        # Check for pattern match before getting move
        pattern_match = solver._check_patterns()
        if pattern_match:
            pattern_matches.append(pattern_match)
        
        move, score = solver.get_optimal_move()
        
        board_state.add(move)
        moves.append(move)
        scores.append(score)
        
        # Computer's random move
        if len(board_state) < 16:
            # Get all possible moves
            possible_moves = [i for i in range(25) if i not in board_state]
            # Make a random move
            computer_move = random.choice(possible_moves)
            board_state.add(computer_move)
            moves.append(computer_move)
            # Add a dummy score for computer moves
            scores.append({'three_line': 0, 'four_line': 0, 'five_line': 0, 'total': 0})
    
    solver = BingoSolver(board_state)
    completed_lines = solver.count_completed_lines()
    
    return GameResult(
        completed_lines=completed_lines,
        moves=moves,
        final_board=board_state,
        scores=scores,
        pattern_matches=pattern_matches
    )

class BingoSimulator:
    def __init__(self, num_games: int = 5000):
        self.num_games = num_games
        self.results: List[GameResult] = []
        
    def run_single_game(self) -> GameResult:
        return run_game()
    
    def run_simulation(self, num_workers: int = 4) -> None:
        """Run multiple games in parallel using multiprocessing"""
        from multiprocessing import Pool
        
        with Pool(num_workers) as pool:
            self.results = list(tqdm(
                pool.imap(run_game, range(self.num_games)),
                total=self.num_games,
                desc="Running simulations"
            ))
    
    def get_statistics(self) -> Dict:
        """Calculate statistics from the simulation results"""
        completed_lines = [r.completed_lines for r in self.results]
        
        # Convert numpy types to Python native types
        return {
            'mean_lines': float(np.mean(completed_lines)),
            'std_lines': float(np.std(completed_lines)),
            'min_lines': int(np.min(completed_lines)),
            'max_lines': int(np.max(completed_lines)),
            'line_distribution': {
                str(i): int(sum(1 for r in completed_lines if r == i))
                for i in range(14)  # Maximum possible lines is 13
            },
            'total_games': len(self.results)
        }
    
    def analyze_move_patterns(self) -> Dict:
        """Analyze patterns in the moves made during games"""
        all_moves = [move for result in self.results for move in result.moves]
        move_frequencies = {}
        
        for i in range(25):
            # Convert to float for JSON serialization
            move_frequencies[str(i)] = float(all_moves.count(i) / len(self.results))
        
        return move_frequencies
    
    def analyze_score_patterns(self) -> Dict:
        """Analyze patterns in the scores during games"""
        # Only consider player moves (every other move)
        all_scores = [score for result in self.results for score in result.scores[::2]]
        
        # Convert numpy types to Python native types
        return {
            'mean_three_line': float(np.mean([s['three_line'] for s in all_scores])),
            'mean_four_line': float(np.mean([s['four_line'] for s in all_scores])),
            'mean_five_line': float(np.mean([s['five_line'] for s in all_scores])),
            'mean_total': float(np.mean([s['total'] for s in all_scores]))
        }
    
    def analyze_pattern_recognition(self) -> Dict:
        """Analyze pattern recognition statistics across all games."""
        total_matches = 0
        pattern_descriptions = []
        
        # Collect pattern matches from all games
        for result in self.results:
            total_matches += len(result.pattern_matches)
            pattern_descriptions.extend(match['description'] for match in result.pattern_matches)
        
        # Calculate pattern match rate
        total_moves = sum(len(result.moves) // 2 for result in self.results)  # Only count player moves
        match_rate = (total_matches / total_moves) * 100 if total_moves > 0 else 0
        
        # Find most common pattern
        pattern_counter = Counter(pattern_descriptions)
        most_common = pattern_counter.most_common(1)[0] if pattern_descriptions else ("None", 0)
        
        return {
            'total_matches': total_matches,
            'match_rate': match_rate,
            'most_common_pattern': {
                'description': most_common[0],
                'count': most_common[1]
            },
            'pattern_counts': dict(pattern_counter)
        } 