import { BingoSolver } from './solver.js';

function evaluateBoard() {
    // Get board state from command line argument
    const boardArg = process.argv[2];
    if (!boardArg) {
        console.error('Board state argument is required');
        process.exit(1);
    }

    // Parse board state into a Set
    const boardState = new Set(
        boardArg === 'empty' ? [] : boardArg.split(',').map(Number)
    );

    // Create solver and evaluate moves
    const solver = new BingoSolver(boardState);
    const evaluations = {};
    
    // Get possible moves and evaluate each one
    const possibleMoves = solver.getPossibleMoves();
    for (const move of possibleMoves) {
        const evaluation = solver.evaluateMove(move);
        evaluations[move] = evaluation;
    }

    // Check for pattern match
    const optimalMove = solver.getOptimalMove();
    if (optimalMove.pattern) {
        evaluations[optimalMove.move] = {
            ...optimalMove.score,
            pattern: optimalMove.pattern
        };
    }
    
    // Output results as JSON
    console.log(JSON.stringify(evaluations));
}

evaluateBoard(); 