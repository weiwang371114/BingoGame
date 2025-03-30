import numpy as np
from typing import Set, List, Dict, Tuple
from scoring_config import LINE_SCORES, IMMEDIATE_BONUSES, MOVE_WEIGHTS, GAME_CONSTRAINTS, NEW_SCORING

class BingoSolver:
    def __init__(self, board_state: Set[int]):
        self.board_state = board_state
        self.line_definitions = {
            # Rows (0-4)
            0: [0, 1, 2, 3, 4],
            1: [5, 6, 7, 8, 9],
            2: [10, 11, 12, 13, 14],
            3: [15, 16, 17, 18, 19],
            4: [20, 21, 22, 23, 24],
            # Columns (5-9)
            5: [0, 5, 10, 15, 20],
            6: [1, 6, 11, 16, 21],
            7: [2, 7, 12, 17, 22],
            8: [3, 8, 13, 18, 23],
            9: [4, 9, 14, 19, 24],
            # Diagonals (12-13)
            12: [0, 6, 12, 18, 24],
            13: [4, 8, 12, 16, 20]
        }
        
        # Pre-compute all possible lines and their sets for faster lookups
        self.line_sets = {k: set(v) for k, v in self.line_definitions.items()}
        self.all_lines = self._generate_all_lines()
        
        # Pre-compute line combinations
        self._three_line_combinations = None
        self._four_line_combinations = None
        self._five_line_combinations = None
        
        # Pre-compute power values for scoring
        self._power_values = {
            i: LINE_SCORES['three_line']['power_base'] ** (LINE_SCORES['three_line']['power_exponent'] - i)
            for i in range(GAME_CONSTRAINTS['max_cells'] + 1)
        }

    def _generate_all_lines(self) -> List[List[int]]:
        lines = []
        
        # Generate all possible lines at once
        for line in self.line_definitions.values():
            # Add the full line
            lines.append(line)
            
            # Add 4-cell lines
            for i in range(len(line)):
                four_line = [x for j, x in enumerate(line) if j != i]
                lines.append(four_line)
            
            # Add 3-cell lines
            for i in range(len(line) - 1):
                for j in range(i + 1, len(line)):
                    three_line = [x for k, x in enumerate(line) if k != i and k != j]
                    lines.append(three_line)

        return lines

    @property
    def three_line_combinations(self) -> List[List[List[int]]]:
        if self._three_line_combinations is None:
            all_lines = list(self.line_definitions.values())
            combinations = []
            
            # Pre-compute unique grids for each line
            line_grids = [set(line) for line in all_lines]
            
            for i in range(len(all_lines)):
                for j in range(i + 1, len(all_lines)):
                    for k in range(j + 1, len(all_lines)):
                        # Use set operations for faster union
                        unique_grids = line_grids[i] | line_grids[j] | line_grids[k]
                        if len(unique_grids) <= GAME_CONSTRAINTS['max_cells']:
                            combinations.append([all_lines[i], all_lines[j], all_lines[k]])
            
            self._three_line_combinations = combinations
        return self._three_line_combinations

    @property
    def four_line_combinations(self) -> List[List[List[int]]]:
        if self._four_line_combinations is None:
            all_lines = list(self.line_definitions.values())
            combinations = []
            
            # Pre-compute unique grids for each line
            line_grids = [set(line) for line in all_lines]
            
            for i in range(len(all_lines)):
                for j in range(i + 1, len(all_lines)):
                    for k in range(j + 1, len(all_lines)):
                        for l in range(k + 1, len(all_lines)):
                            # Use set operations for faster union
                            unique_grids = line_grids[i] | line_grids[j] | line_grids[k] | line_grids[l]
                            if len(unique_grids) <= GAME_CONSTRAINTS['max_cells']:
                                combinations.append([all_lines[i], all_lines[j], all_lines[k], all_lines[l]])
            
            self._four_line_combinations = combinations
        return self._four_line_combinations

    @property
    def five_line_combinations(self) -> List[List[List[int]]]:
        if self._five_line_combinations is None:
            all_lines = list(self.line_definitions.values())
            combinations = []
            
            # Pre-compute unique grids for each line
            line_grids = [set(line) for line in all_lines]
            
            for i in range(len(all_lines)):
                for j in range(i + 1, len(all_lines)):
                    for k in range(j + 1, len(all_lines)):
                        for l in range(k + 1, len(all_lines)):
                            for m in range(l + 1, len(all_lines)):
                                # Use set operations for faster union
                                unique_grids = line_grids[i] | line_grids[j] | line_grids[k] | line_grids[l] | line_grids[m]
                                if len(unique_grids) <= GAME_CONSTRAINTS['max_cells']:
                                    combinations.append([all_lines[i], all_lines[j], all_lines[k], all_lines[l], all_lines[m]])
            
            self._five_line_combinations = combinations
        return self._five_line_combinations

    def get_possible_moves(self) -> List[int]:
        return [i for i in range(GAME_CONSTRAINTS['board_size']) if i not in self.board_state]

    def evaluate_move(self, move: int) -> Dict[str, float]:
        temp_state = self.board_state | {move}
        selected_cells = len(temp_state)

        three_line_score = 0
        four_line_score = 0
        five_line_score = 0

        # Check if we're past the threshold for the new scoring logic
        use_new_scoring = selected_cells > NEW_SCORING['threshold']

        if use_new_scoring:
            # New scoring system after threshold - optimized with sets
            for line_set in self.line_sets.values():
                if move in line_set:
                    selected_count = len(line_set & temp_state)
                    if selected_count == 5:
                        three_line_score += NEW_SCORING['complete_line']
                    elif selected_count == 4:
                        four_line_score += NEW_SCORING['four_cell_line']
                    elif selected_count == 3:
                        three_line_score += NEW_SCORING['three_cell_line']
        else:
            # Original scoring system for first threshold cells
            # Check 3-line solutions
            for combination in self.three_line_combinations:
                required_grids = set().union(*combination)
                not_selected_grids = len(required_grids - temp_state)
                
                if not_selected_grids + selected_cells <= GAME_CONSTRAINTS['max_cells']:
                    score = LINE_SCORES['three_line']['base'] + self._power_values[not_selected_grids + selected_cells]
                    three_line_score += score
                    
                    for line in combination:
                        if all(grid in temp_state for grid in line):
                            three_line_score += IMMEDIATE_BONUSES['complete_line']

            # Check 4-line solutions
            for combination in self.four_line_combinations:
                required_grids = set().union(*combination)
                not_selected_grids = len(required_grids - temp_state)
                
                if not_selected_grids + selected_cells <= GAME_CONSTRAINTS['max_cells']:
                    score = LINE_SCORES['four_line']['base'] + self._power_values[not_selected_grids + selected_cells]
                    four_line_score += score

            # Check 5-line solutions
            for combination in self.five_line_combinations:
                required_grids = set().union(*combination)
                not_selected_grids = len(required_grids - temp_state)
                
                if not_selected_grids + selected_cells <= GAME_CONSTRAINTS['max_cells']:
                    score = LINE_SCORES['five_line']['base'] + self._power_values[not_selected_grids + selected_cells]
                    five_line_score += score

            # Add points for completed lines
            new_line_completed = False
            for line_set in self.line_sets.values():
                if move in line_set and len(line_set & temp_state) == len(line_set):
                    three_line_score += IMMEDIATE_BONUSES['complete_line']
                    new_line_completed = True

            # If no new line completed, check for new 4-cell lines
            if not new_line_completed:
                for line_set in self.line_sets.values():
                    if move in line_set:
                        selected_count = len(line_set & temp_state)
                        if selected_count == 4:
                            four_line_score += IMMEDIATE_BONUSES['four_cell_line']
                        elif selected_count == 3:
                            three_line_score += IMMEDIATE_BONUSES['three_cell_line']

        # Apply weights to scores
        three_line_score *= MOVE_WEIGHTS['three_line']
        four_line_score *= MOVE_WEIGHTS['four_line']
        five_line_score *= MOVE_WEIGHTS['five_line']

        return {
            'three_line': three_line_score,
            'four_line': four_line_score,
            'five_line': five_line_score,
            'total': three_line_score + four_line_score + five_line_score
        }

    def count_completed_lines(self) -> int:
        return sum(1 for line_set in self.line_sets.values() 
                  if all(cell in self.board_state for cell in line_set))

    def get_optimal_move(self) -> Tuple[int, Dict[str, float]]:
        possible_moves = self.get_possible_moves()
        best_move = -1
        best_score = None
        best_score_total = float('-inf')
        
        for move in possible_moves:
            score = self.evaluate_move(move)
            if score['total'] > best_score_total:
                best_score_total = score['total']
                best_score = score
                best_move = move
                
        return best_move, best_score 