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
        const cells = this.board.getElementsByClassName("cell");
        for (let cell of cells) {
            cell.classList.remove('suggested');
            cell.textContent = ''; // Clear any existing text
        }
        
        // Show evaluation points for all remaining cells
        const solver = new BingoSolver(this.selectedCells);
        const possibleMoves = solver.getPossibleMoves();
        
        // Find the highest total score
        let maxScore = -1;
        const scores = possibleMoves.map(move => {
            const score = solver.evaluateMove(move);
            maxScore = Math.max(maxScore, score.total);
            return { move, score };
        });
        
        // Display scores and highlight highest scoring cell
        scores.forEach(({ move, score }) => {
            const cell = this.board.children[move];
            cell.innerHTML = `${score.threeLine}<br>${score.fourLine}<br>${score.fiveLine}`;
            if (score.total === maxScore) {
                cell.classList.add("suggested");
            }
        });
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
