import { LINE_SCORES, IMMEDIATE_BONUSES, NEW_SCORING, MOVE_WEIGHTS, GAME_CONSTRAINTS } from './scoring_config.js';

export class BingoSolver {
    constructor(boardState) {
        this.boardState = boardState;
        this.lineDefinitions = {
            // Rows (0-4)
            0: [0, 1, 2, 3, 4],
            1: [5, 6, 7, 8, 9],
            2: [10, 11, 12, 13, 14],
            3: [15, 16, 17, 18, 19],
            4: [20, 21, 22, 23, 24],
            // Columns (5-9)
            5: [0, 5, 10, 15, 20],
            6: [1, 6, 11, 16, 21],
            7: [2, 7, 12, 17, 22],
            8: [3, 8, 13, 18, 23],
            9: [4, 9, 14, 19, 24],
            // Diagonals (12-13)
            12: [0, 6, 12, 18, 24],
            13: [4, 8, 12, 16, 20]
        };

        // Pre-compute all possible lines and their sets for faster lookups
        this.lineSets = Object.fromEntries(
            Object.entries(this.lineDefinitions).map(([k, v]) => [k, new Set(v)])
        );

        // Pre-compute line combinations
        this._threeLineCombinations = null;
        this._fourLineCombinations = null;
        this._fiveLineCombinations = null;

        // Pre-compute power values for scoring
        this._powerValues = new Map();
        for (let i = 0; i <= GAME_CONSTRAINTS.max_cells; i++) {
            this._powerValues.set(i, Math.pow(
                LINE_SCORES.three_line.power_base,
                LINE_SCORES.three_line.power_exponent - i
            ));
        }
    }

    get threeLineCombinations() {
        if (!this._threeLineCombinations) {
            const allLines = Object.values(this.lineDefinitions);
            const combinations = [];
            
            // Pre-compute unique grids for each line
            const lineGrids = allLines.map(line => new Set(line));
            
            for (let i = 0; i < allLines.length; i++) {
                for (let j = i + 1; j < allLines.length; j++) {
                    for (let k = j + 1; k < allLines.length; k++) {
                        // Use set operations for faster union
                        const uniqueGrids = new Set([...lineGrids[i], ...lineGrids[j], ...lineGrids[k]]);
                        if (uniqueGrids.size <= GAME_CONSTRAINTS.max_cells) {
                            combinations.push([allLines[i], allLines[j], allLines[k]]);
                        }
                    }
                }
            }
            
            this._threeLineCombinations = combinations;
        }
        return this._threeLineCombinations;
    }

    get fourLineCombinations() {
        if (!this._fourLineCombinations) {
            const allLines = Object.values(this.lineDefinitions);
            const combinations = [];
            
            // Pre-compute unique grids for each line
            const lineGrids = allLines.map(line => new Set(line));
            
            for (let i = 0; i < allLines.length; i++) {
                for (let j = i + 1; j < allLines.length; j++) {
                    for (let k = j + 1; k < allLines.length; k++) {
                        for (let l = k + 1; l < allLines.length; l++) {
                            // Use set operations for faster union
                            const uniqueGrids = new Set([...lineGrids[i], ...lineGrids[j], ...lineGrids[k], ...lineGrids[l]]);
                            if (uniqueGrids.size <= GAME_CONSTRAINTS.max_cells) {
                                combinations.push([allLines[i], allLines[j], allLines[k], allLines[l]]);
                            }
                        }
                    }
                }
            }
            
            this._fourLineCombinations = combinations;
        }
        return this._fourLineCombinations;
    }

    get fiveLineCombinations() {
        if (!this._fiveLineCombinations) {
            const allLines = Object.values(this.lineDefinitions);
            const combinations = [];
            
            // Pre-compute unique grids for each line
            const lineGrids = allLines.map(line => new Set(line));
            
            for (let i = 0; i < allLines.length; i++) {
                for (let j = i + 1; j < allLines.length; j++) {
                    for (let k = j + 1; k < allLines.length; k++) {
                        for (let l = k + 1; l < allLines.length; l++) {
                            for (let m = l + 1; m < allLines.length; m++) {
                                // Use set operations for faster union
                                const uniqueGrids = new Set([
                                    ...lineGrids[i], ...lineGrids[j], ...lineGrids[k],
                                    ...lineGrids[l], ...lineGrids[m]
                                ]);
                                if (uniqueGrids.size <= GAME_CONSTRAINTS.max_cells) {
                                    combinations.push([allLines[i], allLines[j], allLines[k], allLines[l], allLines[m]]);
                                }
                            }
                        }
                    }
                }
            }
            
            this._fiveLineCombinations = combinations;
        }
        return this._fiveLineCombinations;
    }

    getPossibleMoves() {
        return Array.from({length: GAME_CONSTRAINTS.board_size}, (_, i) => i)
            .filter(i => !this.boardState.has(i));
    }

    evaluateMove(move) {
        const tempState = new Set(this.boardState);
        tempState.add(move);
        const selectedCells = tempState.size;

        let threeLineScore = 0;
        let fourLineScore = 0;
        let fiveLineScore = 0;

        // Check if we're past the threshold for the new scoring logic
        const useNewScoring = selectedCells > NEW_SCORING.threshold;

        if (useNewScoring) {
            // New scoring system after threshold - optimized with sets
            for (const lineSet of Object.values(this.lineSets)) {
                if (lineSet.has(move)) {
                    const selectedCount = [...lineSet].filter(grid => tempState.has(grid)).length;
                    if (selectedCount === 5) {
                        threeLineScore += NEW_SCORING.complete_line;
                    } else if (selectedCount === 4) {
                        fourLineScore += NEW_SCORING.four_cell_line;
                    } else if (selectedCount === 3) {
                        threeLineScore += NEW_SCORING.three_cell_line;
                    }
                }
            }
        } else {
            // Original scoring system for first threshold cells
            // Check 3-line solutions
            for (const combination of this.threeLineCombinations) {
                const requiredGrids = new Set(combination.flat());
                const notSelectedGrids = [...requiredGrids].filter(grid => !tempState.has(grid)).length;
                
                if (notSelectedGrids + selectedCells <= GAME_CONSTRAINTS.max_cells) {
                    const score = LINE_SCORES.three_line.base + 
                                this._powerValues.get(notSelectedGrids + selectedCells);
                    threeLineScore += score;
                    
                    for (const line of combination) {
                        if (line.every(grid => tempState.has(grid))) {
                            threeLineScore += IMMEDIATE_BONUSES.complete_line;
                        }
                    }
                }
            }
            
            // Check 4-line solutions
            for (const combination of this.fourLineCombinations) {
                const requiredGrids = new Set(combination.flat());
                const notSelectedGrids = [...requiredGrids].filter(grid => !tempState.has(grid)).length;
                
                if (notSelectedGrids + selectedCells <= GAME_CONSTRAINTS.max_cells) {
                    const score = LINE_SCORES.four_line.base + 
                                this._powerValues.get(notSelectedGrids + selectedCells);
                    fourLineScore += score;
                }
            }
            
            // Check 5-line solutions
            for (const combination of this.fiveLineCombinations) {
                const requiredGrids = new Set(combination.flat());
                const notSelectedGrids = [...requiredGrids].filter(grid => !tempState.has(grid)).length;
                
                if (notSelectedGrids + selectedCells <= GAME_CONSTRAINTS.max_cells) {
                    const score = LINE_SCORES.five_line.base + 
                                this._powerValues.get(notSelectedGrids + selectedCells);
                    fiveLineScore += score;
                }
            }

            // Add points for completed lines
            let newLineCompleted = false;
            for (const lineSet of Object.values(this.lineSets)) {
                if (lineSet.has(move) && [...lineSet].every(grid => tempState.has(grid))) {
                    threeLineScore += IMMEDIATE_BONUSES.complete_line;
                    newLineCompleted = true;
                }
            }

            // If no new line completed, check for new 4-cell lines
            if (!newLineCompleted) {
                for (const lineSet of Object.values(this.lineSets)) {
                    if (lineSet.has(move)) {
                        const selectedCount = [...lineSet].filter(grid => tempState.has(grid)).length;
                        if (selectedCount === 4) {
                            fourLineScore += IMMEDIATE_BONUSES.four_cell_line;
                        } else if (selectedCount === 3) {
                            threeLineScore += IMMEDIATE_BONUSES.three_cell_line;
                        }
                    }
                }
            }
        }

        // Apply weights to scores
        threeLineScore *= MOVE_WEIGHTS.three_line;
        fourLineScore *= MOVE_WEIGHTS.four_line;
        fiveLineScore *= MOVE_WEIGHTS.five_line;
        
        return {
            threeLine: threeLineScore,
            fourLine: fourLineScore,
            fiveLine: fiveLineScore,
            total: threeLineScore + fourLineScore + fiveLineScore
        };
    }

    countCompletedLines() {
        return Object.values(this.lineSets)
            .filter(lineSet => [...lineSet].every(cell => this.boardState.has(cell)))
            .length;
    }

    getOptimalMove() {
        const possibleMoves = this.getPossibleMoves();
        let bestMove = -1;
        let bestScore = -Infinity;
        
        for (const move of possibleMoves) {
            const score = this.evaluateMove(move);
            if (score.total > bestScore) {
                bestScore = score.total;
                bestMove = move;
            }
        }
        return bestMove;
    }

    getLineType(line) {
        for (const [key, fullLine] of Object.entries(this.lineDefinitions)) {
            if (line === fullLine) {
                const lineNum = parseInt(key);
                if (lineNum >= 0 && lineNum <= 4) return `Row ${lineNum + 1}`;
                else if (lineNum >= 5 && lineNum <= 9) return `Column ${lineNum - 4}`;
                else if (lineNum === 12) return "Left-to-Right Diagonal";
                else if (lineNum === 13) return "Right-to-Left Diagonal";
            }
        }
        return "Unknown";
    }

    displayLinesTable() {
        const fourLineCombinations = this.getFourLinesTable();
        const fiveLineCombinations = this.getFiveLinesTable();
        
        fourLineCombinations.forEach((combination, index) => {
            const lineTypes = combination.map(line => this.getLineType(line));
            const uniqueGrids = new Set(combination.flat());
        });
        
        fiveLineCombinations.forEach((combination, index) => {
            const lineTypes = combination.map(line => this.getLineType(line));
            const uniqueGrids = new Set(combination.flat());
        });
    }
}
