import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from simulator import BingoSimulator
import json
from pathlib import Path
import numpy as np

def plot_line_distribution(stats: dict, save_path: str = None):
    """Plot the distribution of completed lines across all games"""
    plt.figure(figsize=(10, 6))
    
    # Create histogram from line distribution
    line_counts = stats['line_distribution']
    x = [int(k) for k in line_counts.keys()]
    y = [line_counts[str(k)] for k in x]
    
    plt.bar(x, y, alpha=0.7, color='blue', edgecolor='black')
    
    plt.title('Distribution of Completed Lines')
    plt.xlabel('Number of Completed Lines')
    plt.ylabel('Frequency')
    
    if save_path:
        plt.savefig(save_path)
    plt.close()

def plot_move_frequencies(move_freq: dict, save_path: str = None):
    """Plot the frequency of moves across all games"""
    plt.figure(figsize=(12, 8))
    
    # Create a 5x5 grid of frequencies
    grid = np.zeros((5, 5))
    for i in range(25):
        row, col = divmod(i, 5)
        grid[row, col] = move_freq[str(i)]
    
    # Create heatmap
    sns.heatmap(grid, annot=True, fmt='.3f', cmap='YlOrRd')
    plt.title('Move Frequencies Across All Games')
    
    if save_path:
        plt.savefig(save_path)
    plt.close()

def save_results(stats: dict, move_freq: dict, score_patterns: dict, pattern_stats: dict, output_dir: str):
    """Save all results to JSON files"""
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    # Save statistics
    with open(output_path / 'statistics.json', 'w') as f:
        json.dump(stats, f, indent=2)
    
    # Save move frequencies
    with open(output_path / 'move_frequencies.json', 'w') as f:
        json.dump(move_freq, f, indent=2)
    
    # Save score patterns
    with open(output_path / 'score_patterns.json', 'w') as f:
        json.dump(score_patterns, f, indent=2)
    
    # Save pattern recognition statistics
    with open(output_path / 'pattern_recognition.json', 'w') as f:
        json.dump(pattern_stats, f, indent=2)

def main():
    # Create output directory
    output_dir = Path('results')
    output_dir.mkdir(exist_ok=True)
    
    # Initialize and run simulation
    simulator = BingoSimulator(num_games=5000)
    simulator.run_simulation(num_workers=8)
    
    # Collect results
    stats = simulator.get_statistics()
    move_freq = simulator.analyze_move_patterns()
    score_patterns = simulator.analyze_score_patterns()
    pattern_stats = simulator.analyze_pattern_recognition()
    
    # Save results
    save_results(stats, move_freq, score_patterns, pattern_stats, str(output_dir))
    
    # Create visualizations
    plot_line_distribution(stats, str(output_dir / 'line_distribution.png'))
    plot_move_frequencies(move_freq, str(output_dir / 'move_frequencies.png'))
    
    # Print summary
    print("\nSimulation Results Summary:")
    print(f"Total games played: {stats['total_games']}")
    print(f"Average completed lines: {stats['mean_lines']:.2f}")
    print(f"Standard deviation: {stats['std_lines']:.2f}")
    print(f"Minimum lines: {stats['min_lines']}")
    print(f"Maximum lines: {stats['max_lines']}")
    
    print("\nPattern Recognition Statistics:")
    print(f"Total pattern matches: {pattern_stats['total_matches']}")
    print(f"Pattern match rate: {pattern_stats['match_rate']:.2f}%")
    print(f"Most common pattern: {pattern_stats['most_common_pattern']}")
    
    print("\nScore Patterns:")
    print(f"Average three-line score: {score_patterns['mean_three_line']:.2f}")
    print(f"Average four-line score: {score_patterns['mean_four_line']:.2f}")
    print(f"Average five-line score: {score_patterns['mean_five_line']:.2f}")
    print(f"Average total score: {score_patterns['mean_total']:.2f}")

if __name__ == "__main__":
    main() 