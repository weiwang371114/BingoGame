# Bingo Game

A modern, interactive Bingo game with AI-powered move suggestions and multiple game modes. The game features a sophisticated scoring system and supports both manual and automatic play.

## Features

- **Interactive 5x5 Bingo Board**
- **Multiple Game Modes**
  - Manual Mode: Player makes all moves
  - Auto Mode: Computer makes random moves after player's moves
- **AI-Powered Move Suggestions**
  - Shows best possible moves based on scoring system
  - Displays detailed scoring information for each possible move
- **Bilingual Support**
  - English and Chinese (Traditional) interface
  - Easy language switching
- **Game Controls**
  - Reset game
  - Undo moves
  - Score display toggle
- **Responsive Design**
  - Modern, clean interface
  - Mobile-friendly layout
- **Advanced Scoring System**
  - Original scoring for first 12 moves
  - New scoring system after 12 moves:
    - 100 points for completing a line
    - 25 points for 4-cell line
    - 10 points for 3-cell line

## Project Structure

```
.
├── index.html          # Main HTML file
├── bingo.js           # Main game logic
├── solver.js          # AI solver implementation
├── styles.css         # Styling
├── evaluation/        # Python evaluation tools
│   ├── solver.py     # Python solver implementation
│   ├── simulator.py  # Game simulation tools
│   └── scoring_config.py  # Scoring configuration
├── server.js         # Local development server
└── package.json      # Project dependencies
```

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bingo-game.git
cd bingo-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Game Rules

1. The game is played on a 5x5 grid
2. Players can select up to 16 cells
3. A line is completed when all cells in a row, column, or diagonal are selected
4. The game ends when 16 cells are selected
5. The final score is based on the number of completed lines

## Scoring System

### First 12 Moves
- Complex scoring system considering:
  - Line completion bonuses
  - Potential line combinations
  - Power-based scoring

### After 12 Moves
- Simplified scoring system:
  - 100 points for completing a line
  - 25 points for 4-cell line
  - 10 points for 3-cell line

## Development

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+ (for evaluation tools)

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## Evaluation Tools

The `evaluation` directory contains Python tools for analyzing game performance:

- `solver.py`: Implementation of the AI solver
- `simulator.py`: Tools for running game simulations
- `scoring_config.py`: Configuration for scoring parameters

To run evaluations:
```bash
cd evaluation
python run_simulation.py
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with vanilla JavaScript for optimal performance
- Uses modern CSS for responsive design
