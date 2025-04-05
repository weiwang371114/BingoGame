import { BingoSolver } from './solver.js';

class BingoSimulator {
    constructor(initialBoardState, moveOption1, moveOption2, numGames = 1000, randomOnly = false) {
        this.initialState = new Set(initialBoardState);
        this.moveOption1 = moveOption1;
        this.moveOption2 = moveOption2;
        this.numGames = numGames;
        this.randomOnly = randomOnly;
    }

    getRandomMove(gameState) {
        // Get all available positions
        const availableMoves = Array.from({length: 25}, (_, i) => i)
            .filter(i => !gameState.has(i));
        
        // Select a random move
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }

    simulateGame(startingMove) {
        const gameState = new Set(this.initialState);
        gameState.add(startingMove);
        const movesLeft = 16 - gameState.size;
        
        if (this.randomOnly) {
            // All moves are random after the initial choice
            while (gameState.size < 16) {
                const randomMove = this.getRandomMove(gameState);
                if (randomMove !== undefined) {
                    gameState.add(randomMove);
                } else {
                    break;
                }
            }
        } else {
            // Play out the rest of the game alternating between optimal and random moves
            for (let i = 0; i < movesLeft; i++) {
                if (gameState.size >= 16) break;

                // Make random opponent move
                const randomMove = this.getRandomMove(gameState);
                if (randomMove !== undefined) {
                    gameState.add(randomMove);
                }

                if (gameState.size >= 16) break;

                // Make optimal move
                const solver = new BingoSolver(gameState);
                const nextMove = solver.getOptimalMove();
                if (nextMove === -1) break;
                gameState.add(nextMove);
            }
        }

        // Calculate final score
        const finalSolver = new BingoSolver(gameState);
        const completedLines = finalSolver.countCompletedLines();
        return {
            finalState: Array.from(gameState).sort((a, b) => a - b),
            completedLines,
            moveSequence: Array.from(gameState)
        };
    }

    runSimulation() {
        const results = {
            option1: {
                games: [],
                averageLines: 0,
                lineDistribution: new Map(),
                totalLines: 0,
                moveSequences: []
            },
            option2: {
                games: [],
                averageLines: 0,
                lineDistribution: new Map(),
                totalLines: 0,
                moveSequences: []
            }
        };

        // Run simulations for option 1
        for (let i = 0; i < this.numGames; i++) {
            const game = this.simulateGame(this.moveOption1);
            results.option1.games.push(game);
            results.option1.totalLines += game.completedLines;
            results.option1.moveSequences.push(game.moveSequence);
            
            // Update distribution
            const current = results.option1.lineDistribution.get(game.completedLines) || 0;
            results.option1.lineDistribution.set(game.completedLines, current + 1);
        }

        // Run simulations for option 2
        for (let i = 0; i < this.numGames; i++) {
            const game = this.simulateGame(this.moveOption2);
            results.option2.games.push(game);
            results.option2.totalLines += game.completedLines;
            results.option2.moveSequences.push(game.moveSequence);
            
            // Update distribution
            const current = results.option2.lineDistribution.get(game.completedLines) || 0;
            results.option2.lineDistribution.set(game.completedLines, current + 1);
        }

        // Calculate averages
        results.option1.averageLines = results.option1.totalLines / this.numGames;
        results.option2.averageLines = results.option2.totalLines / this.numGames;

        return results;
    }

    static formatResults(results, isRandomOnly = false) {
        const formatDistribution = (dist) => {
            return Array.from(dist.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([lines, count]) => `${lines} lines: ${count} games (${(count/10).toFixed(1)}%)`)
                .join('\n');
        };

        const getBestGame = (games) => {
            return games.reduce((best, current) => 
                current.completedLines > best.completedLines ? current : best
            );
        };

        const option1Best = getBestGame(results.option1.games);
        const option2Best = getBestGame(results.option2.games);

        return `
Simulation Results (${results.option1.games.length} games per option)
${isRandomOnly ? '*** ALL MOVES RANDOM AFTER INITIAL CHOICE ***' : '*** OPTIMAL VS RANDOM STRATEGY ***'}

Option 1:
---------
Average completed lines: ${results.option1.averageLines.toFixed(2)}
Distribution:
${formatDistribution(results.option1.lineDistribution)}
Best game moves: ${option1Best.moveSequence.join(', ')}
Best game lines: ${option1Best.completedLines}

Option 2:
---------
Average completed lines: ${results.option2.averageLines.toFixed(2)}
Distribution:
${formatDistribution(results.option2.lineDistribution)}
Best game moves: ${option2Best.moveSequence.join(', ')}
Best game lines: ${option2Best.completedLines}

Difference:
----------
Average difference: ${(results.option1.averageLines - results.option2.averageLines).toFixed(2)} lines
`;
    }
}

// Example usage:
// const simulator = new BingoSimulator([1,2,3,4], 5, 6, 1000);
// const results = simulator.runSimulation();
// console.log(BingoSimulator.formatResults(results));

export { BingoSimulator }; 