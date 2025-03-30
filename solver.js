class BingoSolver {
    constructor(boardState) {
        this.boardState = boardState;
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
        // Simulate selecting this move
        const tempState = new Set(this.boardState);
        tempState.add(move);
        
        // Simulate random opponent move
        const possibleOpponentMoves = this.getPossibleMoves()
            .filter(i => i !== move);
        const randomMove = possibleOpponentMoves[
            Math.floor(Math.random() * possibleOpponentMoves.length)
        ];
        tempState.add(randomMove);
        
        // Calculate expected points
        const completedLines = this.countCompletedLines(tempState);
        return this.calculatePoints(completedLines);
    }
    
    countCompletedLines(cells) {
        const rows = Array.from({ length: 5 }, () => Array(5).fill(false));
        cells.forEach((index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            rows[row][col] = true;
        });
        let completedLines = 0;
        for (let i = 0; i < 5; i++) {
            if (rows[i].every((cell) => cell)) completedLines++;
            if (rows.every((row) => row[i])) completedLines++;
        }
        if (rows.every((_, i) => rows[i][i])) completedLines++;
        if (rows.every((_, i) => rows[i][4 - i])) completedLines++;
        return completedLines;
    }
    
    calculatePoints(completedLines) {
        if (completedLines >= 5) return 25;
        if (completedLines >= 4) return 10;
        if (completedLines >= 3) return 2;
        return 0;
    }
}

export default BingoSolver;
