console.log("Bingo script loaded");
import { BingoSolver } from './solver.js';

class BingoGame {
    constructor() {
        this.maxSelections = 16;
        this.board = document.getElementById("bingo-board");
        this.resetButton = document.getElementById("reset-button");
        this.modeSelect = document.getElementById("game-mode");
        this.selectedCells = new Set();
        this.gameMode = "auto"; // Default mode
        
        if (this.resetButton) {
            this.resetButton.addEventListener("click", () => this.resetGame());
        }
        
        if (this.modeSelect) {
            this.modeSelect.addEventListener("change", (e) => {
                this.gameMode = e.target.value;
                this.resetGame();
            });
        }
        
        this.initializeBoard();
        this.resetGame();
    }

    initializeBoard() {
        if (!this.board) return;
        
        this.board.innerHTML = "";
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.textContent = i;
            cell.addEventListener("click", () => this.handleCellClick(i));
            this.board.appendChild(cell);
        }
    }

    handleCellClick(index) {
        if (this.selectedCells.has(index) || this.selectedCells.size >= this.maxSelections) {
            return;
        }

        this.selectCell(index);
        
        if (this.gameMode === "auto") {
            this.makeRandomMove();
        }
        
        // Show best move suggestion in both modes
        this.showBestMove();
    }

    selectCell(index) {
        this.selectedCells.add(index);
        const cell = this.board.children[index];
        cell.classList.add("selected");
    }

    makeRandomMove() {
        if (this.selectedCells.size >= this.maxSelections) return;
        
        const unselectedCells = Array.from({ length: 25 }, (_, i) => i)
            .filter(i => !this.selectedCells.has(i));
        
        if (unselectedCells.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * unselectedCells.length);
        const randomCell = unselectedCells[randomIndex];
        
        this.selectedCells.add(randomCell);
        const cell = this.board.children[randomCell];
        cell.classList.add("random-selected");
    }

    showBestMove() {
        // Clear previous suggestion
        const previousSuggestion = this.board.querySelector('.suggested');
        if (previousSuggestion) {
            previousSuggestion.classList.remove('suggested');
        }
        
        // Show new suggestion
        const solver = new BingoSolver(this.selectedCells);
        const optimalMove = solver.getOptimalMove();
        
        if (optimalMove !== null) {
            const cell = this.board.children[optimalMove];
            cell.classList.add("suggested");
        }
    }

    resetGame() {
        this.selectedCells.clear();
        this.initializeBoard();
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new BingoGame();
});
