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
        this.allLines = this.generateAllLines();
    }

    generateAllLines() {
        const lines = [];
        
        // Generate 5-line solutions
        for (const lineIndex in this.lineDefinitions) {
            lines.push(this.lineDefinitions[lineIndex]);
        }

        // Generate 4-line solutions
        for (const lineIndex in this.lineDefinitions) {
            const fullLine = this.lineDefinitions[lineIndex];
            for (let i = 0; i < fullLine.length; i++) {
                const fourLine = fullLine.filter((_, index) => index !== i);
                lines.push(fourLine);
            }
        }

        // Generate 3-line solutions
        for (const lineIndex in this.lineDefinitions) {
            const fullLine = this.lineDefinitions[lineIndex];
            for (let i = 0; i < fullLine.length - 1; i++) {
                for (let j = i + 1; j < fullLine.length; j++) {
                    const threeLine = fullLine.filter((_, index) => index !== i && index !== j);
                    lines.push(threeLine);
                }
            }
        }

        return lines;
    }

    getThreeLinesTable() {
        const allLines = Object.values(this.lineDefinitions);
        const combinations = [];
        
        // Helper function to get unique grids needed for a combination of lines
        function getUniqueGrids(lines) {
            return new Set(lines.flat());
        }
        
        // Helper function to check if a combination is valid (≤ 16 unique grids)
        function isValidCombination(lines) {
            const uniqueGrids = getUniqueGrids(lines);
            return uniqueGrids.size <= 16;
        }
        
        // Generate all possible combinations of 3 lines
        for (let i = 0; i < allLines.length; i++) {
            for (let j = i + 1; j < allLines.length; j++) {
                for (let k = j + 1; k < allLines.length; k++) {
                    const combination = [allLines[i], allLines[j], allLines[k]];
                    if (isValidCombination(combination)) {
                        combinations.push(combination);
                    }
                }
            }
        }
        
        return combinations;
    }

    getFourLinesTable() {
        const allLines = Object.values(this.lineDefinitions);
        const combinations = [];
        
        // Helper function to get unique grids needed for a combination of lines
        function getUniqueGrids(lines) {
            return new Set(lines.flat());
        }
        
        // Helper function to check if a combination is valid (≤ 16 unique grids)
        function isValidCombination(lines) {
            const uniqueGrids = getUniqueGrids(lines);
            return uniqueGrids.size <= 16;
        }
        
        // Generate all possible combinations of 4 lines
        for (let i = 0; i < allLines.length; i++) {
            for (let j = i + 1; j < allLines.length; j++) {
                for (let k = j + 1; k < allLines.length; k++) {
                    for (let l = k + 1; l < allLines.length; l++) {
                        const combination = [allLines[i], allLines[j], allLines[k], allLines[l]];
                        if (isValidCombination(combination)) {
                            combinations.push(combination);
                        }
                    }
                }
            }
        }
        
        return combinations;
    }

    getFiveLinesTable() {
        const allLines = Object.values(this.lineDefinitions);
        const combinations = [];
        
        // Helper function to get unique grids needed for a combination of lines
        function getUniqueGrids(lines) {
            return new Set(lines.flat());
        }
        
        // Helper function to check if a combination is valid (≤ 16 unique grids)
        function isValidCombination(lines) {
            const uniqueGrids = getUniqueGrids(lines);
            return uniqueGrids.size <= 16;
        }
        
        // Generate all possible combinations of 5 lines
        for (let i = 0; i < allLines.length; i++) {
            for (let j = i + 1; j < allLines.length; j++) {
                for (let k = j + 1; k < allLines.length; k++) {
                    for (let l = k + 1; l < allLines.length; l++) {
                        for (let m = l + 1; m < allLines.length; m++) {
                            const combination = [allLines[i], allLines[j], allLines[k], allLines[l], allLines[m]];
                            if (isValidCombination(combination)) {
                                combinations.push(combination);
                            }
                        }
                    }
                }
            }
        }
        
        return combinations;
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

    getOptimalMove() {
        const possibleMoves = this.getPossibleMoves();
        let bestMove = -1;
        let bestScore = -Infinity;
        
        for (const move of possibleMoves) {
            const score = this.evaluateMove(move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    getPossibleMoves() {
        return Array.from({length: 25}, (_, i) => i)
            .filter(i => !this.boardState.has(i));
    }

    evaluateMove(move) {
        const tempState = new Set(this.boardState);
        tempState.add(move);
        const selectedCells = Array.from(tempState).length;

        let threeLineScore = 0;
        let fourLineScore = 0;
        let fiveLineScore = 0;

        // Check 3-line solutions
        const threeLineCombinations = this.getThreeLinesTable();
        for (const combination of threeLineCombinations) {
            // Get all unique grids needed for this combination
            const requiredGrids = new Set(combination.flat());
            // Count how many grids are not selected
            const notSelectedGrids = Array.from(requiredGrids).filter(grid => !tempState.has(grid)).length;
            
            // If this combination is possible (all required grids are selected or can be selected)
            if (notSelectedGrids + selectedCells <= 16) {
                // Base score for the combination
                threeLineScore += Math.pow(2, 16 - (notSelectedGrids + selectedCells));
                // Check if this move creates a new completed line
                for (const line of combination) {
                    const completedGrids = line.filter(grid => tempState.has(grid)).length;
                    if (completedGrids === line.length) {
                        threeLineScore += 10; // Add 10 points for creating a new completed lineer combination
                    }
                }
            }
        }
        
        // Check 4-line solutions
        const fourLineCombinations = this.getFourLinesTable();
        for (const combination of fourLineCombinations) {
            // Get all unique grids needed for this combination
            const requiredGrids = new Set(combination.flat());
            // Count how many grids are already selected
            const notSelectedGrids = Array.from(requiredGrids).filter(grid => !tempState.has(grid)).length;
            
            // If this combination is possible
            if (notSelectedGrids + selectedCells <= 16) {
                fourLineScore += 20 + Math.pow(2, 16 - (notSelectedGrids + selectedCells));
            }
        }
        
        // Check 5-line solutions
        const fiveLineCombinations = this.getFiveLinesTable();
        for (const combination of fiveLineCombinations) {
            // Get all unique grids needed for this combination
            const requiredGrids = new Set(combination.flat());
            // Count how many grids are already selected
            const notSelectedGrids = Array.from(requiredGrids).filter(grid => !tempState.has(grid)).length;
            
            // If this combination is possible
            if (notSelectedGrids + selectedCells <= 16) {
                fiveLineScore += 50 + Math.pow(2, 16 - (notSelectedGrids + selectedCells));
            }
        }

        // Add points for completed lines
        let newLineCompleted = false;
        for (const line of Object.values(this.lineDefinitions)) {
            const completedGrids = line.filter(grid => tempState.has(grid)).length;
            if (completedGrids === line.length && line.includes(move)) {
                threeLineScore += 100;
                newLineCompleted = true;
            }
        }

        // If no new line completed, check for new 4-cell lines
        if (!newLineCompleted) {
            for (const line of Object.values(this.lineDefinitions)) {
                const selectedAfterMove = line.filter(grid => tempState.has(grid)).length;
                // Add points if this move creates a new 4-cell line
                if (selectedAfterMove === 4 && line.includes(move)) {
                    threeLineScore += 25;
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
}
