# Bingo Game

A web-based Bingo game with AI-powered opponent that uses strategic line completion and combination scoring.

## Features

- 5x5 Bingo board
- AI opponent that:
  - Evaluates moves based on potential line completions
  - Considers 4-line and 5-line combinations
  - Scores moves based on:
    - Completed lines (10 points each)
    - Potential 4-line combinations (10 * 2^available_moves)
    - Potential 5-line combinations (25 * 2^available_moves)
- Maximum 16 moves to complete the game
- Responsive web interface

## How to Play

1. Open the game in a web browser
2. Click on cells to make your moves
3. The AI will automatically make its moves
4. Try to complete lines before the AI does
5. The game ends when either player completes a line or reaches 16 moves

## Technical Details

The AI uses a sophisticated scoring system that:
- Evaluates all possible moves
- Considers both immediate line completions and potential combinations
- Takes into account the remaining moves available
- Prioritizes moves that can lead to multiple line completions

## Setup

1. Clone the repository
2. Open `index.html` in a web browser
3. No additional setup required - it's a pure JavaScript implementation

## Description

This is a simple Bingo game implemented using HTML, CSS, and TypeScript. The game generates a 5x5 grid of cells. When a cell is clicked, it is marked as selected, and a random unselected cell is also marked. The game ends when a maximum number of selections (16) is reached, and a message is displayed indicating the number of completed lines (rows, columns, or diagonals).

## How to Run Locally

1.  Make sure you have a web browser installed (e.g., Chrome, Firefox, Safari).
2.  Open the `index.html` file in your web browser.

## Technologies Used

*   HTML
*   CSS
*   TypeScript

## Files

*   `index.html`: The main HTML file that contains the structure of the game.
*   `bingo.ts`: The TypeScript file that contains the game logic.
*   `bingo.js`: The JavaScript file compiled from the TypeScript file.
