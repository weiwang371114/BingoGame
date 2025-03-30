console.log("Bingo script loaded");
import { BingoSolver } from './solver.js';

class BingoGame {
    constructor() {
        this.maxSelections = 16;
        this.board = document.getElementById("bingo-board");
        this.resetButton = document.getElementById("reset-button");
        this.selectedCells = new Set();
        if (this.resetButton) {
            this.resetButton.addEventListener("click", () => this.resetGame());
        }
        this.initBoard();
    }
    initBoard() {
        if (this.board) {
            for (let i = 0; i < 25; i++) {
                const cell = document.createElement("div");
                cell.classList.add("grid-cell");
                cell.dataset.index = i.toString();
                cell.addEventListener("click", () => this.selectCell(i));
                this.board.appendChild(cell);
            }
        }
    }
    selectCell(index) {
        if (this.selectedCells.has(index))
            return;
        // Mark the current cell
        this.markCell(index);
        // Select a random unselected cell after the current one
        this.selectRandomCell();
        // Show optimal move suggestion
        this.showOptimalMove();
        // Check if we have reached the maximum number of selections
        if (this.selectedCells.size >= this.maxSelections) {
            // Make sure the last pick and the random pick are visible before ending
            setTimeout(() => this.endGame(), 300);
        }
    }
    selectRandomCell() {
        const unselectedCells = Array.from({ length: 25 }, (_, i) => i).filter((i) => !this.selectedCells.has(i));
        if (unselectedCells.length === 0)
            return;
        const randomIndex = Math.floor(Math.random() * unselectedCells.length);
        this.markCell(unselectedCells[randomIndex]);
    }
    markCell(index) {
        this.selectedCells.add(index);
        if (this.board) {
            const cell = this.board.querySelector(`[data-index="${index}"]`);
            if (cell)
                cell.classList.add("selected");
        }
    }
    endGame() {
        const completedLines = this.countCompletedLines();
        alert(`Game over! You completed ${completedLines} lines.`);
    }
    countCompletedLines() {
        const rows = Array.from({ length: 5 }, () => Array(5).fill(false));
        this.selectedCells.forEach((index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            rows[row][col] = true;
        });
        let completedLines = 0;
        // Check rows and columns
        for (let i = 0; i < 5; i++) {
            if (rows[i].every((cell) => cell))
                completedLines++; // row
            if (rows.every((row) => row[i]))
                completedLines++; // column
        }
        // Check diagonals
        if (rows.every((_, i) => rows[i][i]))
            completedLines++; // top-left to bottom-right
        if (rows.every((_, i) => rows[i][4 - i]))
            completedLines++; // top-right to bottom-left
        return completedLines;
    }
    resetGame() {
        // Clear selected cells and reset the board
        this.selectedCells.clear(); // Clear the internal set
        if (this.board) {
            const cells = this.board.querySelectorAll(".grid-cell");
            // Remove both "selected" and "suggested" classes from each grid cell
            cells.forEach((cell) => {
                cell.classList.remove("selected");
                cell.classList.remove("suggested");
            });
        }
    }
    
    showOptimalMove() {
        // Clear previous suggestion
        if (this.board) {
            const previousSuggestion = this.board.querySelector('.suggested');
            if (previousSuggestion) {
                previousSuggestion.classList.remove('suggested');
            }
        }
        
        // Show new suggestion
        const solver = new BingoSolver(this.selectedCells);
        const optimalMove = solver.getOptimalMove();
        if (this.board && optimalMove !== -1) {
            const cell = this.board.querySelector(`[data-index="${optimalMove}"]`);
            if (cell) {
                cell.classList.add("suggested");
            }
        }
    }
}
new BingoGame();
