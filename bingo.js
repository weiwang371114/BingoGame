console.log("Bingo script loaded");
import { BingoSolver } from './solver.js';

class BingoGame {
    constructor() {
        this.maxSelections = 16;
        this.board = document.getElementById("bingo-board");
        this.resetButton = document.getElementById("reset-button");
        this.modeSelect = document.getElementById("game-mode");
        this.modal = document.getElementById("result-modal");
        this.resultMessage = document.getElementById("result-message");
        this.modalResetButton = document.getElementById("modal-reset-button");
        this.selectedCells = new Set();
        
        // Load saved mode or use default
        this.gameMode = localStorage.getItem('bingoGameMode') || "auto";
        if (this.modeSelect) {
            this.modeSelect.value = this.gameMode;
        }
        
        if (this.resetButton) {
            this.resetButton.addEventListener("click", () => this.resetGame());
        }
        
        if (this.modeSelect) {
            this.modeSelect.addEventListener("change", (e) => {
                this.gameMode = e.target.value;
                localStorage.setItem('bingoGameMode', this.gameMode);
                this.resetGame();
            });
        }

        if (this.modalResetButton) {
            this.modalResetButton.addEventListener("click", () => {
                this.modal.style.display = "none";
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
            cell.dataset.index = i; // Store the index as data attribute instead of text content
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
        
        // Show best move suggestion only if we haven't reached max selections
        if (this.selectedCells.size < this.maxSelections) {
            this.showBestMove();
        }

        // Check if game is over
        if (this.selectedCells.size >= this.maxSelections) {
            setTimeout(() => this.endGame(), 500); // Add a small delay to show the last move
        }
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
        // Clear previous suggestions
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('suggested');
            cell.classList.remove('suggested-second');
        });

        // If we've already selected 16 cells or game is over, don't show suggestions
        if (this.selectedCells.size >= 16 || this.gameOver) {
            return;
        }

        const solver = new BingoSolver(this.selectedCells);
        let bestScore = -Infinity;
        let secondBestScore = -Infinity;
        let bestMove = -1;
        let secondBestMove = -1;

        // Evaluate all possible moves
        for (let i = 0; i < 25; i++) {
            if (!this.selectedCells.has(i)) {
                const score = solver.evaluateMove(i).total;
                if (score > bestScore) {
                    secondBestScore = bestScore;
                    secondBestMove = bestMove;
                    bestScore = score;
                    bestMove = i;
                } else if (score > secondBestScore && score < bestScore) {
                    secondBestScore = score;
                    secondBestMove = i;
                }
            }
        }

        // Show best move
        if (bestMove !== -1) {
            const bestCell = document.querySelector(`[data-index="${bestMove}"]`);
            bestCell.classList.add('suggested');
        }

        // Show second best move if it has a different score
        if (secondBestMove !== -1 && secondBestScore < bestScore) {
            const secondBestCell = document.querySelector(`[data-index="${secondBestMove}"]`);
            secondBestCell.classList.add('suggested-second');
        }
    }

    resetGame() {
        this.selectedCells.clear();
        this.initializeBoard();
    }

    endGame() {
        // Implement end game logic
        console.log("Game over!");
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new BingoGame();
});
