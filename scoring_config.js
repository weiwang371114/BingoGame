export const LINE_SCORES = {
    three_line: {
        base: 0,      // Base score for completing a 3-line combination
        power_base: 3,    // Base for exponential scoring
        power_exponent: 16, // Maximum number of cells
    },
    four_line: {
        base: 25,     // Base score for completing a 4-line combination
        power_base: 3,
        power_exponent: 16,
    },
    five_line: {
        base: 100,    // Base score for completing a 5-line combination
        power_base: 3,
        power_exponent: 16,
    }
};

// Immediate line completion bonuses
export const IMMEDIATE_BONUSES = {
    complete_line: 50,    // Bonus for completing a line immediately
    four_cell_line: 25,   // Bonus for creating a 4-cell line
    three_cell_line: 10,   // Bonus for creating a 3-cell line
};

// New scoring system parameters (after 12 cells)
export const NEW_SCORING = {
    complete_line: 100,    // Points for completing a line
    four_cell_line: 25,   // Points for 4-cell line
    three_cell_line: 10,   // Points for 3-cell line
    threshold: 12,        // Number of cells after which new scoring takes effect
};

// Move evaluation weights
export const MOVE_WEIGHTS = {
    three_line: 1.0,  // Further decreased to reduce impact of immediate three-line gains
    four_line: 1.0,   // Significantly increased to strongly favor four-line potential
    five_line: 1.0,
};

// Game constraints
export const GAME_CONSTRAINTS = {
    max_cells: 16,        // Maximum number of cells that can be selected
    board_size: 25,       // Total number of cells on the board
    min_cells_for_line: 3, // Minimum cells needed to form a line
    max_cells_for_line: 5, // Maximum cells in a line
}; 