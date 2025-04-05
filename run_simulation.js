import { BingoSimulator } from './simulation.js';

function parseBoard(boardString) {
    return boardString.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
    console.log(`
Usage: node run_simulation.js <initial_board> <option1> <option2> [num_games] [random_only]
    initial_board: Comma-separated list of numbers representing the current board state
    option1: First move option to test
    option2: Second move option to test
    num_games: (Optional) Number of games to simulate (default: 1000)
    random_only: (Optional) Set to 'random' to use random moves only (default: false)

Example: node run_simulation.js "1,2,3,4,5" 6 7 1000 random
`);
    process.exit(1);
}

const initialBoard = parseBoard(args[0]);
const option1 = parseInt(args[1]);
const option2 = parseInt(args[2]);
const numGames = args[3] ? parseInt(args[3]) : 1000;
const randomOnly = args[4] === 'random';

if (isNaN(option1) || isNaN(option2) || option1 < 0 || option1 > 24 || option2 < 0 || option2 > 24) {
    console.error('Error: Move options must be valid board positions (0-24)');
    process.exit(1);
}

if (initialBoard.some(x => x < 0 || x > 24)) {
    console.error('Error: Board positions must be between 0 and 24');
    process.exit(1);
}

if (initialBoard.includes(option1) || initialBoard.includes(option2)) {
    console.error('Error: Move options cannot be positions that are already taken');
    process.exit(1);
}

console.log(`Running simulation with:
Initial board: ${initialBoard.join(', ')}
Option 1: ${option1}
Option 2: ${option2}
Number of games: ${numGames}
Strategy: ${randomOnly ? 'Random moves only' : 'Optimal vs Random'}
`);

const simulator = new BingoSimulator(initialBoard, option1, option2, numGames, randomOnly);
const results = simulator.runSimulation();
console.log(BingoSimulator.formatResults(results, randomOnly)); 