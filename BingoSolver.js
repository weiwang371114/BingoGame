var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// BingoSolver.ts
var BingoSolver = /** @class */ (function () {
    function BingoSolver(validCombinations) {
        var _this = this;
        this.lines = {
            1: new Set(["0,0", "1,0", "2,0", "3,0", "4,0"]), // Column 1
            2: new Set(["0,1", "1,1", "2,1", "3,1", "4,1"]), // Column 2
            3: new Set(["0,2", "1,2", "2,2", "3,2", "4,2"]), // Column 3
            4: new Set(["0,3", "1,3", "2,3", "3,3", "4,3"]), // Column 4
            5: new Set(["0,4", "1,4", "2,4", "3,4", "4,4"]), // Column 5
            6: new Set(["0,0", "0,1", "0,2", "0,3", "0,4"]), // Row 1
            7: new Set(["1,0", "1,1", "1,2", "1,3", "1,4"]), // Row 2
            8: new Set(["2,0", "2,1", "2,2", "2,3", "2,4"]), // Row 3
            9: new Set(["3,0", "3,1", "3,2", "3,3", "3,4"]), // Row 4
            10: new Set(["4,0", "4,1", "4,2", "4,3", "4,4"]), // Row 5
            11: new Set(["0,0", "1,1", "2,2", "3,3", "4,4"]), // Diagonal \
            12: new Set(["0,4", "1,3", "2,2", "3,1", "4,0"]), // Diagonal /
        };
        this.validCombinations = validCombinations;
        this.combinationGrids = this.validCombinations.map(function (comb) {
            var grids = new Set();
            comb.forEach(function (line) { return _this.lines[line].forEach(function (grid) { return grids.add(grid); }); });
            return grids;
        });
    }
    BingoSolver.prototype.getUnselectedGrids = function (board) {
        var unselectedGrids = [];
        for (var r = 0; r < 5; r++) {
            for (var c = 0; c < 5; c++) {
                if (board[r][c] === 0) {
                    unselectedGrids.push("".concat(r, ",").concat(c));
                }
            }
        }
        return unselectedGrids;
    };
    BingoSolver.prototype.solveNextMove = function (board) {
        var _this = this;
        var unselectedGrids = this.getUnselectedGrids(board);
        var bestMove = null;
        unselectedGrids.forEach(function (grid) {
            var _a = grid.split(",").map(Number), r = _a[0], c = _a[1];
            board[r][c] = 1; // Mark the cell as selected
            var score = _this.calculateScore(board);
            if (!bestMove || score > _this.calculateScore(board)) {
                bestMove = grid;
            }
            board[r][c] = 0; // Reset the board
        });
        return bestMove;
    };
    BingoSolver.prototype.calculateScore = function (board) {
        var score = 0;
        Object.values(this.lines).forEach(function (line) {
            var selectedCount = __spreadArray([], line, true).filter(function (grid) { return board[parseInt(grid.split(",")[0])][parseInt(grid.split(",")[1])] === 1; }).length;
            if (selectedCount === 5)
                score++;
        });
        return score;
    };
    return BingoSolver;
}());
