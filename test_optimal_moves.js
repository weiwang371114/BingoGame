import { BingoSolver } from './solver.js';

// Test cases of verified optimal moves
const testCases = [
    {
        name: "Row completion potential case",
        boardState: [0, 1, 2, 3, 4, 8, 12, 16, 17, 20],
        expectedMove: 18,
        description: "Move 18 is verified to be better than alternatives through simulation"
    }
    // Add more verified cases here
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
    const move18Score = solver.evaluateMove(18);
    const move6Score = solver.evaluateMove(6);
    
    console.log("\nDetailed Score Analysis:");
    console.log("\nMove 18 (Expected Best):");
    console.log(JSON.stringify(move18Score, null, 2));
    console.log("\nMove 6 (Alternative Move):");
    console.log(JSON.stringify(move6Score, null, 2));
    
    // Calculate score differences
    const scoreDiff = {
        threeLine: move18Score.threeLine - move6Score.threeLine,
        fourLine: move18Score.fourLine - move6Score.fourLine,
        fiveLine: move18Score.fiveLine - move6Score.fiveLine,
        total: move18Score.total - move6Score.total
    };
    
    console.log("\nScore Differences (Move 18 - Move 6):");
    console.log(JSON.stringify(scoreDiff, null, 2));
    
    if (actualMove === test.expectedMove) {
        console.log("\n✓ PASS: Solver suggests the verified optimal move");
        passedTests++;
    } else {
        console.log("\n✗ FAIL: Solver suggests move ${actualMove} instead of ${test.expectedMove}");
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
function visualizeBoard(boardState, move1, move2) {
    const board = Array(25).fill('.');
    boardState.forEach(pos => board[pos] = 'X');
    board[move1] = '1';
    board[move2] = '2';
    
    console.log("Board Visualization (X=selected, 1=move18, 2=move6):");
    for (let i = 0; i < 5; i++) {
        console.log(board.slice(i*5, (i+1)*5).join(' '));
    }
}

// Show board visualization for the test case
const currentTest = testCases[0];
console.log("Current Board State Analysis:");
visualizeBoard(currentTest.boardState, 18, 6);

console.log(`\nResults: ${passedTests}/${testCases.length} tests passed\n`); 