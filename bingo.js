var BingoGame = /** @class */ (function () {
    function BingoGame() {
        var _this = this;
        this.maxSelections = 16;
        this.board = document.getElementById("bingo-board");
        this.resetButton = document.getElementById("reset-button");
        this.selectedCells = new Set();
        this.resetButton.addEventListener("click", function () { return _this.resetGame(); });
        this.initBoard();
    }
    BingoGame.prototype.initBoard = function () {
        var _this = this;
        var _loop_1 = function (i) {
            var cell = document.createElement("div");
            cell.classList.add("grid-cell");
            cell.dataset.index = i.toString();
            cell.addEventListener("click", function () { return _this.selectCell(i); });
            this_1.board.appendChild(cell);
        };
        var this_1 = this;
        for (var i = 0; i < 25; i++) {
            _loop_1(i);
        }
    };
    BingoGame.prototype.selectCell = function (index) {
        var _this = this;
        if (this.selectedCells.has(index))
            return;
        // Mark the current cell
        this.markCell(index);
        // Select a random unselected cell after the current one
        this.selectRandomCell();
        // Check if we have reached the maximum number of selections
        if (this.selectedCells.size >= this.maxSelections) {
            // Make sure the last pick and the random pick are visible before ending
            setTimeout(function () { return _this.endGame(); }, 300);
        }
    };
    BingoGame.prototype.selectRandomCell = function () {
        var _this = this;
        var unselectedCells = Array.from({ length: 25 }, function (_, i) { return i; }).filter(function (i) { return !_this.selectedCells.has(i); });
        if (unselectedCells.length === 0)
            return;
        var randomIndex = Math.floor(Math.random() * unselectedCells.length);
        this.markCell(unselectedCells[randomIndex]);
    };
    BingoGame.prototype.markCell = function (index) {
        this.selectedCells.add(index);
        var cell = this.board.querySelector("[data-index=\"".concat(index, "\"]"));
        if (cell)
            cell.classList.add("selected");
    };
    BingoGame.prototype.endGame = function () {
        var completedLines = this.countCompletedLines();
        alert("Game over! You completed ".concat(completedLines, " lines."));
    };
    BingoGame.prototype.countCompletedLines = function () {
        var rows = Array.from({ length: 5 }, function () { return Array(5).fill(false); });
        this.selectedCells.forEach(function (index) {
            var row = Math.floor(index / 5);
            var col = index % 5;
            rows[row][col] = true;
        });
        var completedLines = 0;
        var _loop_2 = function (i) {
            if (rows[i].every(function (cell) { return cell; }))
                completedLines++; // row
            if (rows.every(function (row) { return row[i]; }))
                completedLines++; // column
        };
        // Check rows and columns
        for (var i = 0; i < 5; i++) {
            _loop_2(i);
        }
        // Check diagonals
        if (rows.every(function (_, i) { return rows[i][i]; }))
            completedLines++; // top-left to bottom-right
        if (rows.every(function (_, i) { return rows[i][4 - i]; }))
            completedLines++; // top-right to bottom-left
        return completedLines;
    };
    BingoGame.prototype.resetGame = function () {
        // Clear selected cells and reset the board
        this.selectedCells.clear();
        var cells = this.board.querySelectorAll(".grid-cell");
        cells.forEach(function (cell) { return cell.classList.remove("selected"); });
    };
    return BingoGame;
}());
new BingoGame();
