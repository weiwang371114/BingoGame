# Bingo Strategy Evaluation

This project evaluates the performance of the Bingo game strategy by running multiple simulations and analyzing the results.

## Setup

1. Create a Python virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Simulation

To run the simulation with default settings (50,000 games):
```bash
python run_simulation.py
```

## Output

The simulation will create a `results` directory containing:

1. **statistics.json**: Overall statistics including:
   - Mean number of completed lines
   - Standard deviation
   - Minimum and maximum lines
   - Distribution of completed lines

2. **move_frequencies.json**: Analysis of which positions were chosen most often

3. **score_patterns.json**: Analysis of scoring patterns during games

4. **line_distribution.png**: Visualization of the distribution of completed lines

5. **move_frequencies.png**: Heatmap showing which positions were chosen most frequently

## Customization

You can modify the simulation parameters in `run_simulation.py`:
- `num_games`: Number of games to simulate (default: 50000)
- `num_workers`: Number of parallel processes (default: 4)

## Analysis

The simulation analyzes:
1. Overall performance metrics
2. Move patterns and frequencies
3. Scoring patterns
4. Distribution of completed lines

This helps evaluate the effectiveness of the current strategy and identify potential improvements. 