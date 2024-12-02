// BingoSolver.ts

class BingoSolver {
    private lines: { [key: number]: Set<string> };
    private validCombinations: number[][];
    private combinationGrids: Set<string>[];
  
    constructor(validCombinations: number[][]) {
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
      this.combinationGrids = this.validCombinations.map(comb => {
        const grids = new Set<string>();
        comb.forEach(line => this.lines[line].forEach(grid => grids.add(grid)));
        return grids;
      });
    }
  
    getUnselectedGrids(board: number[][]): string[] {
      const unselectedGrids: string[] = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (board[r][c] === 0) {
            unselectedGrids.push(`${r},${c}`);
          }
        }
      }
      return unselectedGrids;
    }
  
    solveNextMove(board: number[][]): string | null {
      const unselectedGrids = this.getUnselectedGrids(board);
      let bestMove: string | null = null;
  
      unselectedGrids.forEach(grid => {
        const [r, c] = grid.split(",").map(Number);
        board[r][c] = 1; // Mark the cell as selected
        const score = this.calculateScore(board);
        if (!bestMove || score > this.calculateScore(board)) {
          bestMove = grid;
        }
        board[r][c] = 0; // Reset the board
      });
  
      return bestMove;
    }
  
    calculateScore(board: number[][]): number {
      let score = 0;
      Object.values(this.lines).forEach(line => {
        const selectedCount = [...line].filter(grid => board[parseInt(grid.split(",")[0])][parseInt(grid.split(",")[1])] === 1).length;
        if (selectedCount === 5) score++;
      });
      return score;
    }
  }