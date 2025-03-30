console.log("Bingo script loaded");
import { BingoSolver } from './solver.js';

const translations = {
    'zh': {
        'Manual Mode': '手動模式',
        'Auto Mode': '自動模式',
        'Reset Game': '重新開始',
        'Move Back': '上一步',
        'Game Mode': '遊戲模式',
        'Game Over': '遊戲結束',
        'Language': '語言',
        'Show Scores': '分數檢查',
        'Game End Info': '遊戲結束！完成 {lines} 條線',
        'Game Title': '賓果遊戲'
    },
    'en': {
        'Manual Mode': 'Manual Mode',
        'Auto Mode': 'Auto Mode',
        'Reset Game': 'Reset Game',
        'Move Back': 'Undo',
        'Game Mode': 'Game Mode',
        'Game Over': 'Game Over',
        'Language': 'Language',
        'Show Scores': 'score check',
        'Game End Info': 'Game Over! Completed {lines} lines',
        'Game Title': 'Bingo Game'
    }
};

class BingoGame {
    constructor() {
        this.maxSelections = 16;
        this.board = document.getElementById("bingo-board");
        this.resetButton = document.getElementById("reset-button");
        this.modeSelect = document.getElementById("game-mode");
        this.modal = document.getElementById("result-modal");
        this.resultMessage = document.getElementById("result-message");
        this.modalResetButton = document.getElementById("modal-reset-button");
        this.moveBackButton = document.getElementById("move-back-button");
        this.languageSelect = document.getElementById("language-select");
        this.showScoresCheckbox = document.getElementById("show-scores");
        this.gameInfo = document.getElementById("game-info");
        this.selectedCells = new Set();
        this.moveHistory = [];
        
        // Load saved preferences
        this.currentLang = localStorage.getItem('bingoGameLang') || 'zh';
        this.gameMode = localStorage.getItem('bingoGameMode') || "auto";
        this.showScores = localStorage.getItem('bingoShowScores') === 'true';
        
        // Initialize UI states
        if (this.languageSelect) {
            this.languageSelect.value = this.currentLang;
        }
        if (this.modeSelect) {
            this.modeSelect.value = this.gameMode;
        }
        if (this.showScoresCheckbox) {
            this.showScoresCheckbox.checked = this.showScores;
            this.showScoresCheckbox.addEventListener("change", (e) => {
                this.showScores = e.target.checked;
                localStorage.setItem('bingoShowScores', this.showScores);
                this.showBestMove(); // Refresh display
            });
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

        if (this.languageSelect) {
            this.languageSelect.addEventListener("change", (e) => {
                this.currentLang = e.target.value;
                localStorage.setItem('bingoGameLang', this.currentLang);
                this.updateTranslations();
            });
        }

        if (this.modalResetButton) {
            this.modalResetButton.addEventListener("click", () => {
                this.modal.style.display = "none";
                this.resetGame();
            });
        }

        if (this.moveBackButton) {
            this.moveBackButton.addEventListener("click", () => this.moveBack());
            this.moveBackButton.disabled = true;
        }
        
        this.initializeBoard();
        this.updateTranslations();
        this.resetGame();
    }

    updateTranslations() {
        // Update title
        const title = document.querySelector('h1');
        if (title) {
            title.textContent = translations[this.currentLang]['Game Title'];
        }

        // Update mode select options
        if (this.modeSelect) {
            const manualOption = this.modeSelect.querySelector('option[value="manual"]');
            const autoOption = this.modeSelect.querySelector('option[value="auto"]');
            if (manualOption) {
                manualOption.textContent = translations[this.currentLang]['Manual Mode'];
            }
            if (autoOption) {
                autoOption.textContent = translations[this.currentLang]['Auto Mode'];
            }
        }

        // Update buttons
        if (this.resetButton) {
            this.resetButton.textContent = translations[this.currentLang]['Reset Game'];
        }
        if (this.moveBackButton) {
            this.moveBackButton.textContent = translations[this.currentLang]['Move Back'];
        }
        if (this.modalResetButton) {
            this.modalResetButton.textContent = translations[this.currentLang]['Reset Game'];
        }

        // Update labels
        const modeLabel = document.querySelector('label[for="game-mode"]');
        if (modeLabel) {
            modeLabel.textContent = translations[this.currentLang]['Game Mode'] + ':';
        }
        
        const langLabel = document.querySelector('label[for="language-select"]');
        if (langLabel) {
            langLabel.textContent = translations[this.currentLang]['Language'] + ':';
        }

        const scoresLabel = document.querySelector('label[for="show-scores"]');
        if (scoresLabel) {
            scoresLabel.textContent = translations[this.currentLang]['Show Scores'] + ':';
        }
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
        
        // Show best move after board is initialized
        this.showBestMove();
    }

    moveBack() {
        if (this.moveHistory.length === 0) return;

        // Remove the last two moves (player's move and computer's move in auto mode)
        if (this.gameMode === "auto" && this.moveHistory.length >= 2) {
            const lastMove = this.moveHistory.pop();
            const secondLastMove = this.moveHistory.pop();
            
            this.selectedCells.delete(lastMove);
            this.selectedCells.delete(secondLastMove);
            
            const lastCell = this.board.children[lastMove];
            const secondLastCell = this.board.children[secondLastMove];
            
            lastCell.classList.remove("random-selected");
            secondLastCell.classList.remove("selected");
        } else {
            // Remove just the last move in manual mode
            const lastMove = this.moveHistory.pop();
            this.selectedCells.delete(lastMove);
            const lastCell = this.board.children[lastMove];
            lastCell.classList.remove("selected");
        }

        // Update move back button state
        this.moveBackButton.disabled = this.moveHistory.length === 0;

        // Show best move for the new state
        this.showBestMove();
    }

    handleCellClick(index) {
        // Only prevent selection if the cell is already selected or if we're at 16 cells
        if (this.selectedCells.has(index) || this.selectedCells.size >= this.maxSelections) {
            return;
        }

        this.selectCell(index);
        this.moveHistory.push(index);
        this.moveBackButton.disabled = false;
        
        if (this.gameMode === "auto") {
            this.makeRandomMove();
        }
        
        // Show best move suggestion only if we haven't reached max selections
        if (this.selectedCells.size < this.maxSelections && !(this.gameMode === "auto" && this.selectedCells.size == 15)) {
            this.showBestMove();
        }

        // Check if game is over
        if (this.selectedCells.size >= this.maxSelections) {
            setTimeout(() => this.endGame(), 500);
        }
    }

    selectCell(index) {
        this.selectedCells.add(index);
        const cell = this.board.children[index];
        cell.classList.add("selected");
        cell.classList.remove("suggested");
    }

    makeRandomMove() {
        if (this.selectedCells.size >= this.maxSelections) return;
        
        const unselectedCells = Array.from({ length: 25 }, (_, i) => i)
            .filter(i => !this.selectedCells.has(i));
        
        if (unselectedCells.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * unselectedCells.length);
        const randomCell = unselectedCells[randomIndex];
        
        this.selectedCells.add(randomCell);
        this.moveHistory.push(randomCell);
        const cell = this.board.children[randomCell];
        cell.classList.add("random-selected");
    }

    showBestMove() {
        // Clear previous suggestions
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('suggested');
            cell.textContent = '';  // Clear any previous score display
        });

        // If we've already selected 16 cells or game is over, don't show suggestions
        if (this.selectedCells.size >= 16 || this.gameOver) {
            return;
        }

        const solver = new BingoSolver(this.selectedCells);
        let bestScore = -Infinity;
        let bestMove = -1;

        // Evaluate all possible moves
        for (let i = 0; i < 25; i++) {
            if (!this.selectedCells.has(i)) {
                const score = solver.evaluateMove(i);
                if (score.total > bestScore) {
                    bestScore = score.total;
                    bestMove = i;
                }
                
                // If showing scores is enabled, display them on each available cell
                if (this.showScores) {
                    const cell = document.querySelector(`[data-index="${i}"]`);
                    if (cell) {
                        cell.innerHTML = `3L:${score.threeLine}<br>4L:${score.fourLine}<br>5L:${score.fiveLine}`;
                    }
                }
            }
        }

        // Show best move
        if (bestMove !== -1) {
            const bestCell = document.querySelector(`[data-index="${bestMove}"]`);
            bestCell.classList.add('suggested');
        }
    }

    resetGame() {
        this.selectedCells.clear();
        this.moveHistory = [];
        if (this.moveBackButton) {
            this.moveBackButton.disabled = true;
        }
        if (this.gameInfo) {
            this.gameInfo.classList.remove('show');
        }
        this.initializeBoard();
        // No need to call showBestMove() here as it's already called in initializeBoard()
    }

    endGame() {
        // Clear any suggestions
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('suggested');
            cell.textContent = '';  // Clear any score displays
        });

        // Count completed lines
        const solver = new BingoSolver(this.selectedCells);
        const completedLines = solver.countCompletedLines();
        
        // Show game info
        if (this.gameInfo) {
            const message = translations[this.currentLang]['Game End Info'].replace('{lines}', completedLines);
            this.gameInfo.textContent = message;
            this.gameInfo.classList.add('show');
        }
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new BingoGame();
});
