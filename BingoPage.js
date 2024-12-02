// BingoPage.ts
var board = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
];
// Example valid combinations (you can load your actual combinations here)
var validCombinations = [
    [1, 2, 3], // Example combination for rows, columns, or diagonals
    [4, 5, 6] // Example
];
var solver = new BingoSolver(validCombinations);
// Helper function to highlight the best move on the board
function highlightBestMove(bestMove) {
    if (bestMove) {
        var _a = bestMove.split(",").map(Number), r = _a[0], c = _a[1];
        var cell = document.querySelector("[data-index=\"".concat(r, ",").concat(c, "\"]"));
        if (cell) {
            cell.classList.add("highlight");
        }
    }
}
// Function to randomly select an unselected grid
function selectRandomGrid() {
    var unselectedGrids = solver.getUnselectedGrids(board);
    if (unselectedGrids.length === 0)
        return;
    var randomIndex = Math.floor(Math.random() * unselectedGrids.length);
    var selectedGrid = unselectedGrids[randomIndex];
    var _a = selectedGrid.split(",").map(Number), r = _a[0], c = _a[1];
    board[r][c] = 1; // Mark as selected
    var cell = document.querySelector("[data-index=\"".concat(r, ",").concat(c, "\"]"));
    if (cell) {
        cell.classList.add("selected");
    }
    // After random selection, highlight the next best move
    var bestMove = solver.solveNextMove(board);
    highlightBestMove(bestMove);
}
// Initialize the board (render the cells)
function initBoard() {
    var boardElement = document.getElementById("bingo-board");
    for (var r = 0; r < 5; r++) {
        for (var c = 0; c < 5; c++) {
            var cell = document.createElement("div");
            cell.classList.add("grid-cell");
            cell.dataset.index = "".concat(r, ",").concat(c);
            cell.addEventListener("click", function () { return selectRandomGrid(); });
            boardElement.appendChild(cell);
        }
    }
    // Highlight the initial best move
    var bestMove = solver.solveNextMove(board);
    highlightBestMove(bestMove);
}
// Call initBoard on page load
window.onload = initBoard;
