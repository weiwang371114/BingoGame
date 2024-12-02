class BingoGame {
    private board: HTMLDivElement;
    private selectedCells: Set<number>;
    private maxSelections = 16;
  
    constructor() {
      this.board = document.getElementById("bingo-board") as HTMLDivElement;
      this.selectedCells = new Set();
      this.initBoard();
    }
  
    private initBoard() {
      for (let i = 0; i < 25; i++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");
        cell.dataset.index = i.toString();
        cell.addEventListener("click", () => this.selectCell(i));
        this.board.appendChild(cell);
      }
    }
  
    private selectCell(index: number) {
      if (this.selectedCells.has(index)) return;
  
      this.markCell(index);
      this.selectRandomCell();
  
      if (this.selectedCells.size >= this.maxSelections) {
        this.endGame();
      }
    }
  
    private selectRandomCell() {
      const unselectedCells = Array.from({ length: 25 }, (_, i) => i).filter(
        (i) => !this.selectedCells.has(i)
      );
      if (unselectedCells.length === 0) return;
  
      const randomIndex = Math.floor(Math.random() * unselectedCells.length);
      this.markCell(unselectedCells[randomIndex]);
    }
  
    private markCell(index: number) {
      this.selectedCells.add(index);
      const cell = this.board.querySelector(`[data-index="${index}"]`) as HTMLDivElement;
      if (cell) cell.classList.add("selected");
    }
  
    private endGame() {
      const completedLines = this.countCompletedLines();
      alert(`Game over! You completed ${completedLines} lines.`);
    }
  
    private countCompletedLines(): number {
      const rows: boolean[][] = Array.from({ length: 5 }, () => Array(5).fill(false));
  
      this.selectedCells.forEach((index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;
        rows[row][col] = true;
      });
  
      let completedLines = 0;
  
      // Check rows and columns
      for (let i = 0; i < 5; i++) {
        if (rows[i].every((cell) => cell)) completedLines++; // row
        if (rows.every((row) => row[i])) completedLines++; // column
      }
  
      // Check diagonals
      if (rows.every((_, i) => rows[i][i])) completedLines++; // top-left to bottom-right
      if (rows.every((_, i) => rows[i][4 - i])) completedLines++; // top-right to bottom-left
  
      return completedLines;
    }
  }
  
  new BingoGame();
  