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
        for (let i = 0; i <= 16; i++) {
            this._powerValues.set(i, Math.pow(3, 16 - i));
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
                        if (uniqueGrids.size <= 16) {
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
                            if (uniqueGrids.size <= 16) {
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
                                const uniqueGrids = new Set([...lineGrids[i], ...lineGrids[j], ...lineGrids[k], ...lineGrids[l], ...lineGrids[m]]);
                                if (uniqueGrids.size <= 16) {
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
        return Array.from({length: 25}, (_, i) => i)
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
        const useNewScoring = selectedCells > 12;

        if (useNewScoring) {
            // New scoring system after threshold - optimized with sets
            for (const lineSet of Object.values(this.lineSets)) {
                if (lineSet.has(move)) {
                    const selectedCount = [...lineSet].filter(grid => tempState.has(grid)).length;
                    if (selectedCount === 5) {
                        threeLineScore += 100;
                    } else if (selectedCount === 4) {
                        fourLineScore += 25;
                    } else if (selectedCount === 3) {
                        threeLineScore += 10;
                    }
                }
            }
        } else {
            // Original scoring system for first threshold cells
            // Check 3-line solutions
            for (const combination of this.threeLineCombinations) {
                const requiredGrids = new Set(combination.flat());
                const notSelectedGrids = [...requiredGrids].filter(grid => !tempState.has(grid)).length;
                
                if (notSelectedGrids + selectedCells <= 16) {
                    threeLineScore += this._powerValues.get(notSelectedGrids + selectedCells);
                    
                    for (const line of combination) {
                        if (line.every(grid => tempState.has(grid))) {
                            threeLineScore += 10;
                        }
                    }
                }
            }
            
            // Check 4-line solutions
            for (const combination of this.fourLineCombinations) {
                const requiredGrids = new Set(combination.flat());
                const notSelectedGrids = [...requiredGrids].filter(grid => !tempState.has(grid)).length;
                
                if (notSelectedGrids + selectedCells <= 16) {
                    fourLineScore += 25 + this._powerValues.get(notSelectedGrids + selectedCells);
                }
            }
            
            // Check 5-line solutions
            for (const combination of this.fiveLineCombinations) {
                const requiredGrids = new Set(combination.flat());
                const notSelectedGrids = [...requiredGrids].filter(grid => !tempState.has(grid)).length;
                
                if (notSelectedGrids + selectedCells <= 16) {
                    fiveLineScore += 100 + this._powerValues.get(notSelectedGrids + selectedCells);
                }
            }

            // Add points for completed lines
            let newLineCompleted = false;
            for (const lineSet of Object.values(this.lineSets)) {
                if (lineSet.has(move) && [...lineSet].every(grid => tempState.has(grid))) {
                    threeLineScore += 100;
                    newLineCompleted = true;
                }
            }

            // If no new line completed, check for new 4-cell lines
            if (!newLineCompleted) {
                for (const lineSet of Object.values(this.lineSets)) {
                    if (lineSet.has(move)) {
                        const selectedCount = [...lineSet].filter(grid => tempState.has(grid)).length;
                        if (selectedCount === 4) {
                            fourLineScore += 25;
                        } else if (selectedCount === 3) {
                            threeLineScore += 10;
                        }
                    }
                }
            }
        }
        
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
