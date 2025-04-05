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

function analyzeCombinations(solver, boardState, move) {
    const tempState = new Set(boardState);
    tempState.add(move);
    
    let analysis = {
        threeLineCombos: [],
        fourLineCombos: [],
        fiveLineCombos: []
    };
    
    // Analyze three-line combinations
    for (const combination of solver.threeLineCombinations) {
        const requiredGrids = new Set(combination.flat());
        const selectedInCombo = [...requiredGrids].filter(grid => tempState.has(grid));
        const remainingGrids = [...requiredGrids].filter(grid => !tempState.has(grid));
        
        if (remainingGrids.length + tempState.size <= 16) {
            analysis.threeLineCombos.push({
                lines: combination.map(line => `[${line.join(',')}]`),
                selectedCount: selectedInCombo.length,
                remainingMoves: remainingGrids,
                isComplete: remainingGrids.length === 0
            });
        }
    }
    
    // Analyze four-line combinations
    for (const combination of solver.fourLineCombinations) {
        const requiredGrids = new Set(combination.flat());
        const selectedInCombo = [...requiredGrids].filter(grid => tempState.has(grid));
        const remainingGrids = [...requiredGrids].filter(grid => !tempState.has(grid));
        
        if (remainingGrids.length + tempState.size <= 16) {
            analysis.fourLineCombos.push({
                lines: combination.map(line => `[${line.join(',')}]`),
                selectedCount: selectedInCombo.length,
                remainingMoves: remainingGrids,
                isComplete: remainingGrids.length === 0
            });
        }
    }
    
    // Analyze five-line combinations
    for (const combination of solver.fiveLineCombinations) {
        const requiredGrids = new Set(combination.flat());
        const selectedInCombo = [...requiredGrids].filter(grid => tempState.has(grid));
        const remainingGrids = [...requiredGrids].filter(grid => !tempState.has(grid));
        
        if (remainingGrids.length + tempState.size <= 16) {
            analysis.fiveLineCombos.push({
                lines: combination.map(line => `[${line.join(',')}]`),
                selectedCount: selectedInCombo.length,
                remainingMoves: remainingGrids,
                isComplete: remainingGrids.length === 0
            });
        }
    }
    
    return analysis;
}

function printCombinationAnalysis(analysis, moveType) {
    console.log(`\n${moveType} Analysis:`);
    
    // Three-line combinations
    console.log("\n3-Line Combinations:");
    analysis.threeLineCombos.forEach((combo, i) => {
        console.log(`\nCombination ${i + 1}:`);
        console.log(`Lines: ${combo.lines.join(' + ')}`);
        console.log(`Selected cells: ${combo.selectedCount}`);
        console.log(`Remaining moves: [${combo.remainingMoves.join(', ')}]`);
        console.log(`Status: ${combo.isComplete ? 'COMPLETE' : `${combo.remainingMoves.length} moves needed`}`);
    });
    
    // Four-line combinations
    console.log("\n4-Line Combinations:");
    analysis.fourLineCombos.forEach((combo, i) => {
        console.log(`\nCombination ${i + 1}:`);
        console.log(`Lines: ${combo.lines.join(' + ')}`);
        console.log(`Selected cells: ${combo.selectedCount}`);
        console.log(`Remaining moves: [${combo.remainingMoves.join(', ')}]`);
        console.log(`Status: ${combo.isComplete ? 'COMPLETE' : `${combo.remainingMoves.length} moves needed`}`);
    });
    
    // Five-line combinations
    console.log("\n5-Line Combinations:");
    analysis.fiveLineCombos.forEach((combo, i) => {
        console.log(`\nCombination ${i + 1}:`);
        console.log(`Lines: ${combo.lines.join(' + ')}`);
        console.log(`Selected cells: ${combo.selectedCount}`);
        console.log(`Remaining moves: [${combo.remainingMoves.join(', ')}]`);
        console.log(`Status: ${combo.isComplete ? 'COMPLETE' : `${combo.remainingMoves.length} moves needed`}`);
    });
}

function printDetailedScoreAnalysis(moveScore, moveType) {
    console.log(`\n${moveType} Detailed Scoring Breakdown:`);
    
    // Print scoring system being used
    console.log(`Using ${moveScore.details.useNewScoring ? 'new' : 'original'} scoring system`);
    
    // Three-line combinations
    console.log('\n3-Line Scoring:');
    console.log(`Base Score: ${moveScore.details.threeLine.base}`);
    console.log(`Power Score: ${moveScore.details.threeLine.power}`);
    console.log(`Immediate Bonuses: ${moveScore.details.threeLine.immediate}`);
    console.log(`Total (with weight): ${moveScore.threeLine}`);
    
    console.log('\nDetailed 3-Line Combinations:');
    moveScore.details.threeLine.combinations.forEach((combo, i) => {
        console.log(`\nCombination ${i + 1}:`);
        if (combo.lines) {
            console.log(`Lines: ${combo.lines.map(line => `[${line.join(',')}]`).join(' + ')}`);
            console.log(`Remaining Moves: ${combo.remainingMoves}`);
            console.log(`Base Score: ${combo.baseScore}`);
            console.log(`Power Score: ${combo.powerScore}`);
            console.log(`Immediate Bonus: ${combo.immediateBonus || 0}`);
        } else {
            // For new scoring system
            console.log(`Line: [${combo.line.join(',')}]`);
            console.log(`Type: ${combo.type}`);
            console.log(`Score: ${combo.score}`);
        }
    });
    
    // Four-line combinations
    console.log('\n4-Line Scoring:');
    console.log(`Base Score: ${moveScore.details.fourLine.base}`);
    console.log(`Power Score: ${moveScore.details.fourLine.power}`);
    console.log(`Immediate Bonuses: ${moveScore.details.fourLine.immediate}`);
    console.log(`Total (with weight): ${moveScore.fourLine}`);
    
    // Five-line combinations
    console.log('\n5-Line Scoring:');
    console.log(`Base Score: ${moveScore.details.fiveLine.base}`);
    console.log(`Power Score: ${moveScore.details.fiveLine.power}`);
    console.log(`Immediate Bonuses: ${moveScore.details.fiveLine.immediate}`);
    console.log(`Total (with weight): ${moveScore.fiveLine}`);
    
    console.log('\nFinal Total Score:', moveScore.total);
}

// Run the tests
console.log("Running Optimal Move Verification Tests\n");

let passedTests = 0;
for (const test of testCases) {
    console.log(`Test: ${test.name}`);
    console.log(`Board: [${test.boardState.join(', ')}]`);
    console.log(`Expected optimal move: ${test.expectedMove}`);
    
    const solver = new BingoSolver(new Set(test.boardState));
    const result = solver.getOptimalMove();
    const actualMove = result.move;
    
    // Print detailed analysis
    console.log("\nDetailed Move Analysis:");
    console.log("======================");

    // Print pattern recognition results
    if (result.pattern) {
        console.log("\nPattern Recognition:");
        console.log("-----------------");
        console.log(`Recognized Pattern: ${result.pattern}`);
        console.log(`Suggested Move: ${result.move}`);
    }

    // Print score comparison
    console.log("\nScore Analysis:");
    console.log("--------------");
    console.log("Expected Move (18):");
    const expectedScore = solver.evaluateMove(test.expectedMove);
    console.log(JSON.stringify(expectedScore, null, 2));

    console.log("\nActual Move:", actualMove);
    console.log(JSON.stringify(result.score, null, 2));

    // Print score differences
    console.log("\nScore Differences (Actual - Expected):");
    console.log("------------------------------------");
    console.log(`Three-line: ${result.score.threeLine - expectedScore.threeLine}`);
    console.log(`Four-line: ${result.score.fourLine - expectedScore.fourLine}`);
    console.log(`Five-line: ${result.score.fiveLine - expectedScore.fiveLine}`);
    console.log(`Total: ${result.score.total - expectedScore.total}`);

    // Analyze combinations for both moves
    console.log("\n=== DETAILED COMBINATION ANALYSIS ===");
    const expectedAnalysis = analyzeCombinations(solver, test.boardState, test.expectedMove);
    const actualAnalysis = analyzeCombinations(solver, test.boardState, actualMove);
    
    printCombinationAnalysis(expectedAnalysis, `Expected Move (${test.expectedMove})`);
    printCombinationAnalysis(actualAnalysis, `Actual Move (${actualMove})`);
    
    if (actualMove === test.expectedMove) {
        console.log("\n✓ PASS: Solver suggests the verified optimal move");
        passedTests++;
    } else {
        console.log(`\n✗ FAIL: Solver suggests move ${actualMove} instead of ${test.expectedMove}`);
        console.log("\nPossible issues in scoring system:");
        if (result.score.total < expectedScore.total) {
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
    if (actualMove !== expectedMove) {
        board[actualMove] = 'A';
    }
    
    console.log("Board Visualization (X=selected, E=expected move, A=actual move):");
    for (let i = 0; i < 5; i++) {
        console.log(board.slice(i*5, (i+1)*5).join(' '));
    }
}

// Show board visualization for the test case
const currentTest = testCases[0];
const solver = new BingoSolver(new Set(currentTest.boardState));
const result = solver.getOptimalMove();
console.log("Current Board State Analysis:");
visualizeBoard(currentTest.boardState, currentTest.expectedMove, result.move);

console.log(`\nResults: ${passedTests}/${testCases.length} tests passed\n`); 