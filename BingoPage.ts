// BingoPage.ts

let board: number[][] = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];
  
  // Example valid combinations (you can load your actual combinations here)
  const validCombinations = [
    [1, 2, 3], // Example combination for rows, columns, or diagonals
    [4, 5, 6]  // Example
  ];
  
  const solver = new BingoSolver(validCombinations);
  
  // Helper function to highlight the best move on the board
  function highlightBestMove(bestMove: string | null) {
    if (bestMove) {
      const [r, c] = bestMove.split(",").map(Number);
      const cell = document.querySelector(`[data-index="${r},${c}"]`) as HTMLDivElement;
      if (cell) {
        cell.classList.add("highlight");
      }
    }
  }
  
  // Function to randomly select an unselected grid
  function selectRandomGrid() {
    const unselectedGrids = solver.getUnselectedGrids(board);
    if (unselectedGrids.length === 0) return;
  
    const randomIndex = Math.floor(Math.random() * unselectedGrids.length);
    const selectedGrid = unselectedGrids[randomIndex];
    const [r, c] = selectedGrid.split(",").map(Number);
  
    board[r][c] = 1; // Mark as selected
    const cell = document.querySelector(`[data-index="${r},${c}"]`) as HTMLDivElement;
    if (cell) {
      cell.classList.add("selected");
    }
  
    // After random selection, highlight the next best move
    const bestMove = solver.solveNextMove(board);
    highlightBestMove(bestMove);
  }
  
  // Initialize the board (render the cells)
  function initBoard() {
    const boardElement = document.getElementById("bingo-board") as HTMLDivElement;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-cell");
        cell.dataset.index = `${r},${c}`;
        cell.addEventListener("click", () => selectRandomGrid());
        boardElement.appendChild(cell);
      }
    }
  
    // Highlight the initial best move
    const bestMove = solver.solveNextMove(board);
    highlightBestMove(bestMove);
  }
  
  // Call initBoard on page load
  window.onload = initBoard;