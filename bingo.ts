class BingoGame {
  private board: HTMLDivElement;
  private selectedCells: Set<number>;
  private maxSelections = 16;
  private resetButton: HTMLButtonElement;

  constructor() {
    this.board = document.getElementById("bingo-board") as HTMLDivElement;
    this.resetButton = document.getElementById("reset-button") as HTMLButtonElement;
    this.selectedCells = new Set();
    this.resetButton.addEventListener("click", () => this.resetGame());
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

    // Mark the current cell
    this.markCell(index);
    
    // Select a random unselected cell after the current one
    this.selectRandomCell();

    // Check if we have reached the maximum number of selections
    if (this.selectedCells.size >= this.maxSelections) {
      // Make sure the last pick and the random pick are visible before ending
      setTimeout(() => this.endGame(), 300);
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

  private resetGame() {
    // Clear selected cells and reset the board
    this.selectedCells.clear(); // Clear the internal set
    const cells = this.board.querySelectorAll(".grid-cell");

    // Remove the "selected" class from each grid cell
    cells.forEach((cell) => cell.classList.remove("selected"));
  }
}

new BingoGame();
