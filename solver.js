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

        // Pre-compute transformations for pattern matching
        this._transformations = this._generateTransformations();
        
        // Known optimal patterns
        this.patterns = [
            {
                cells: [0, 1, 2, 3, 4, 8, 12, 16, 17, 20],
                optimalMove: 18,
                description: "Row completion with diagonal potential",
                moveCount: 10  // Number of cells already selected
            }
        ];
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

        let scoreDetails = {
            threeLine: {
                base: 0,
                power: 0,
                immediate: 0,
                combinations: []
            },
            fourLine: {
                base: 0,
                power: 0,
                immediate: 0,
                combinations: []
            },
            fiveLine: {
                base: 0,
                power: 0,
                immediate: 0,
                combinations: []
            },
            useNewScoring: selectedCells > NEW_SCORING.threshold
        };

        // Check if we're past the threshold for the new scoring logic
        const useNewScoring = selectedCells > NEW_SCORING.threshold;

        if (useNewScoring) {
            // New scoring system after threshold - optimized with sets
            for (const [lineId, lineSet] of Object.entries(this.lineSets)) {
                if (lineSet.has(move)) {
                    const selectedCount = [...lineSet].filter(grid => tempState.has(grid)).length;
                    if (selectedCount === 5) {
                        scoreDetails.threeLine.immediate += NEW_SCORING.complete_line;
                        scoreDetails.threeLine.combinations.push({
                            line: [...lineSet],
                            type: 'complete',
                            score: NEW_SCORING.complete_line
                        });
                    } else if (selectedCount === 4) {
                        scoreDetails.fourLine.immediate += NEW_SCORING.four_cell_line;
                        scoreDetails.fourLine.combinations.push({
                            line: [...lineSet],
                            type: 'four-cell',
                            score: NEW_SCORING.four_cell_line
                        });
                    } else if (selectedCount === 3) {
                        scoreDetails.threeLine.immediate += NEW_SCORING.three_cell_line;
                        scoreDetails.threeLine.combinations.push({
                            line: [...lineSet],
                            type: 'three-cell',
                            score: NEW_SCORING.three_cell_line
                        });
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
                    const powerScore = this._powerValues.get(notSelectedGrids + selectedCells);
                    scoreDetails.threeLine.base += LINE_SCORES.three_line.base;
                    scoreDetails.threeLine.power += powerScore;
                    
                    let combinationDetails = {
                        lines: combination,
                        remainingMoves: notSelectedGrids,
                        powerScore: powerScore,
                        baseScore: LINE_SCORES.three_line.base,
                        immediateBonus: 0
                    };
                    
                    for (const line of combination) {
                        if (line.every(grid => tempState.has(grid))) {
                            scoreDetails.threeLine.immediate += IMMEDIATE_BONUSES.complete_line;
                            combinationDetails.immediateBonus += IMMEDIATE_BONUSES.complete_line;
                        }
                    }
                    
                    scoreDetails.threeLine.combinations.push(combinationDetails);
                }
            }
            
            // Check 4-line solutions
            for (const combination of this.fourLineCombinations) {
                const requiredGrids = new Set(combination.flat());
                const notSelectedGrids = [...requiredGrids].filter(grid => !tempState.has(grid)).length;
                
                if (notSelectedGrids + selectedCells <= GAME_CONSTRAINTS.max_cells) {
                    const powerScore = this._powerValues.get(notSelectedGrids + selectedCells);
                    scoreDetails.fourLine.base += LINE_SCORES.four_line.base;
                    scoreDetails.fourLine.power += powerScore;
                    
                    scoreDetails.fourLine.combinations.push({
                        lines: combination,
                        remainingMoves: notSelectedGrids,
                        powerScore: powerScore,
                        baseScore: LINE_SCORES.four_line.base
                    });
                }
            }
            
            // Check 5-line solutions
            for (const combination of this.fiveLineCombinations) {
                const requiredGrids = new Set(combination.flat());
                const notSelectedGrids = [...requiredGrids].filter(grid => !tempState.has(grid)).length;
                
                if (notSelectedGrids + selectedCells <= GAME_CONSTRAINTS.max_cells) {
                    const powerScore = this._powerValues.get(notSelectedGrids + selectedCells);
                    scoreDetails.fiveLine.base += LINE_SCORES.five_line.base;
                    scoreDetails.fiveLine.power += powerScore;
                    
                    scoreDetails.fiveLine.combinations.push({
                        lines: combination,
                        remainingMoves: notSelectedGrids,
                        powerScore: powerScore,
                        baseScore: LINE_SCORES.five_line.base
                    });
                }
            }
        }

        // Calculate total scores with weights
        const totalThreeLine = (scoreDetails.threeLine.base + scoreDetails.threeLine.power + scoreDetails.threeLine.immediate) * MOVE_WEIGHTS.three_line;
        const totalFourLine = (scoreDetails.fourLine.base + scoreDetails.fourLine.power + scoreDetails.fourLine.immediate) * MOVE_WEIGHTS.four_line;
        const totalFiveLine = (scoreDetails.fiveLine.base + scoreDetails.fiveLine.power + scoreDetails.fiveLine.immediate) * MOVE_WEIGHTS.five_line;

        return {
            threeLine: Math.round(totalThreeLine),
            fourLine: Math.round(totalFourLine),
            fiveLine: Math.round(totalFiveLine),
            total: Math.round(totalThreeLine + totalFourLine + totalFiveLine),
            details: scoreDetails
        };
    }

    countCompletedLines() {
        return Object.values(this.lineSets)
            .filter(lineSet => [...lineSet].every(cell => this.boardState.has(cell)))
            .length;
    }

    _generateTransformations() {
        const transformations = [];
        
        // Identity transformation
        transformations.push(i => i);
        
        // Rotations (90, 180, 270 degrees)
        transformations.push(i => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            return col * 5 + (4 - row); // 90 degrees clockwise
        });
        transformations.push(i => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            return (4 - row) * 5 + (4 - col); // 180 degrees
        });
        transformations.push(i => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            return (4 - col) * 5 + row; // 270 degrees clockwise
        });
        
        // Flips (horizontal and vertical)
        transformations.push(i => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            return row * 5 + (4 - col); // Horizontal flip
        });
        transformations.push(i => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            return (4 - row) * 5 + col; // Vertical flip
        });
        
        // Diagonal flips
        transformations.push(i => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            return col * 5 + row; // Main diagonal flip
        });
        transformations.push(i => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            return (4 - col) * 5 + (4 - row); // Other diagonal flip
        });
        
        return transformations;
    }

    _matchPattern(pattern) {
        // First check if the move count matches
        if (this.boardState.size !== pattern.moveCount) return null;

        const currentCells = [...this.boardState].sort((a, b) => a - b);
        
        // Try all transformations
        for (const transform of this._transformations) {
            // Transform the pattern
            const transformedPattern = pattern.cells.map(transform).sort((a, b) => a - b);
            
            // Check if transformed pattern matches current board state
            if (JSON.stringify(transformedPattern) === JSON.stringify(currentCells)) {
                // If match found, transform the optimal move
                return transform(pattern.optimalMove);
            }
        }
        
        return null;
    }

    _checkPatterns() {
        for (const pattern of this.patterns) {
            const matchedMove = this._matchPattern(pattern);
            if (matchedMove !== null) {
                return {
                    move: matchedMove,
                    description: pattern.description
                };
            }
        }
        return null;
    }

    getOptimalMove() {
        // First check for known patterns
        const patternMatch = this._checkPatterns();
        if (patternMatch) {
            // Evaluate the pattern-matched move to get its score
            const score = this.evaluateMove(patternMatch.move);
            return {
                move: patternMatch.move,
                score: score,
                pattern: patternMatch.description
            };
        }

        // Fall back to regular evaluation if no pattern matches
        const possibleMoves = this.getPossibleMoves();
        let bestMove = -1;
        let bestScore = null;
        let bestScoreTotal = -Infinity;
        
        for (const move of possibleMoves) {
            const score = this.evaluateMove(move);
            if (score.total > bestScoreTotal) {
                bestScoreTotal = score.total;
                bestScore = score;
                bestMove = move;
            }
        }
        
        return {
            move: bestMove,
            score: bestScore,
            pattern: null
        };
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
