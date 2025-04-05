import { BingoSolver } from './solver.js';

// Test cases of verified optimal moves
const testCases = [
    {
        name: "Row completion potential case",
        boardState: [0, 1, 2, 3, 4, 8, 12, 16, 17, 20],
        expectedMove: 18,
        description: "Move 18 is verified to be better than alternatives through simulation"
    }
];

// Run the tests
console.log("Running Optimal Move Verification Tests\n");

let passedTests = 0;
for (const test of testCases) {
    console.log(`Test: ${test.name}`);
    console.log(`Board: [${test.boardState.join(', ')}]`);
    console.log(`Expected optimal move: ${test.expectedMove}`);
    
    const solver = new BingoSolver(new Set(test.boardState));
    const actualMove = solver.getOptimalMove();
    
    // Analyze scores for both moves
    const expectedMoveScore = solver.evaluateMove(test.expectedMove);
    const actualMoveScore = solver.evaluateMove(actualMove);
    
    console.log("\nDetailed Score Analysis:");
    console.log(`\nExpected Move (${test.expectedMove}):`);
    console.log(JSON.stringify(expectedMoveScore, null, 2));
    console.log(`\nActual Move (${actualMove}):`);
    console.log(JSON.stringify(actualMoveScore, null, 2));
    
    // Calculate score differences
    const scoreDiff = {
        threeLine: expectedMoveScore.threeLine - actualMoveScore.threeLine,
        fourLine: expectedMoveScore.fourLine - actualMoveScore.fourLine,
        fiveLine: expectedMoveScore.fiveLine - actualMoveScore.fiveLine,
        total: expectedMoveScore.total - actualMoveScore.total
    };
    
    console.log("\nScore Differences (Expected - Actual):");
    console.log(JSON.stringify(scoreDiff, null, 2));
    
    if (actualMove === test.expectedMove) {
        console.log("\n✓ PASS: Solver suggests the verified optimal move");
        passedTests++;
    } else {
        console.log(`\n✗ FAIL: Solver suggests move ${actualMove} instead of ${test.expectedMove}`);
        console.log("\nPossible issues in scoring system:");
        if (scoreDiff.total < 0) {
            console.log("- Current heuristic values immediate gains over long-term potential");
            console.log("- Might need to adjust weights for different line types");
            console.log("- Consider adding position-based strategic value");
        }
    }
    console.log("\n" + "=".repeat(50) + "\n");
}

// Analyze the board state visually
function visualizeBoard(boardState, expectedMove, actualMove) {
    const board = Array(25).fill('.');
    boardState.forEach(pos => board[pos] = 'X');
    board[expectedMove] = 'E';
    board[actualMove] = 'A';
    
    console.log("Board Visualization (X=selected, E=expected move, A=actual move):");
    for (let i = 0; i < 5; i++) {
        console.log(board.slice(i*5, (i+1)*5).join(' '));
    }
}

// Show board visualization for the test case
const currentTest = testCases[0];
const solver = new BingoSolver(new Set(currentTest.boardState));
const actualMove = solver.getOptimalMove();
console.log("Current Board State Analysis:");
visualizeBoard(currentTest.boardState, currentTest.expectedMove, actualMove);

console.log(`\nResults: ${passedTests}/${testCases.length} tests passed\n`); 