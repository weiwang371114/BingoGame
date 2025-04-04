// Load the trained model
let bingoModel = null;

async function loadModel() {
    try {
        const response = await fetch('bingo_model.pth');
        bingoModel = await response.arrayBuffer();
        console.log('Bingo AI model loaded successfully');
    } catch (error) {
        console.error('Error loading Bingo AI model:', error);
    }
}

// Function to get the best move from the model
function getBestMove(board, validMoves) {
    if (!bingoModel) {
        // If model not loaded, fall back to random selection
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    }

    // Convert board to model input format
    const modelInput = new Float32Array(25);
    for (let i = 0; i < 25; i++) {
        modelInput[i] = board.has(i) ? 1 : 0;
    }

    // TODO: Add model inference code here
    // For now, return random move as fallback
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
}

// Modify the original selectRandomCell function in BingoGame class
BingoGame.prototype.selectRandomCell = function() {
    const unselectedCells = Array.from({ length: 25 }, (_, i) => i)
        .filter(i => !this.selectedCells.has(i));
    
    if (unselectedCells.length === 0) return;

    // Get the best move from the AI model
    const bestMove = getBestMove(this.selectedCells, unselectedCells);
    this.markCell(bestMove);
};

// Load the model when the page loads
window.addEventListener('load', loadModel); 