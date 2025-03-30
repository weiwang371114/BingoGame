import numpy as np
from typing import Set, List, Dict, Tuple
from scoring_config import LINE_SCORES, IMMEDIATE_BONUSES, MOVE_WEIGHTS, GAME_CONSTRAINTS

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
        self.all_lines = self._generate_all_lines()

    def _generate_all_lines(self) -> List[List[int]]:
        lines = []
        
        # Generate 5-line solutions
        for line in self.line_definitions.values():
            lines.append(line)

        # Generate 4-line solutions
        for line in self.line_definitions.values():
            for i in range(len(line)):
                four_line = [x for j, x in enumerate(line) if j != i]
                lines.append(four_line)

        # Generate 3-line solutions
        for line in self.line_definitions.values():
            for i in range(len(line) - 1):
                for j in range(i + 1, len(line)):
                    three_line = [x for k, x in enumerate(line) if k != i and k != j]
                    lines.append(three_line)

        return lines

    def get_three_lines_table(self) -> List[List[int]]:
        all_lines = list(self.line_definitions.values())
        combinations = []
        
        def get_unique_grids(lines: List[List[int]]) -> Set[int]:
            return set().union(*lines)
        
        def is_valid_combination(lines: List[List[int]]) -> bool:
            return len(get_unique_grids(lines)) <= GAME_CONSTRAINTS['max_cells']
        
        for i in range(len(all_lines)):
            for j in range(i + 1, len(all_lines)):
                for k in range(j + 1, len(all_lines)):
                    combination = [all_lines[i], all_lines[j], all_lines[k]]
                    if is_valid_combination(combination):
                        combinations.append(combination)
        
        return combinations

    def get_four_lines_table(self) -> List[List[int]]:
        all_lines = list(self.line_definitions.values())
        combinations = []
        
        def get_unique_grids(lines: List[List[int]]) -> Set[int]:
            return set().union(*lines)
        
        def is_valid_combination(lines: List[List[int]]) -> bool:
            return len(get_unique_grids(lines)) <= GAME_CONSTRAINTS['max_cells']
        
        for i in range(len(all_lines)):
            for j in range(i + 1, len(all_lines)):
                for k in range(j + 1, len(all_lines)):
                    for l in range(k + 1, len(all_lines)):
                        combination = [all_lines[i], all_lines[j], all_lines[k], all_lines[l]]
                        if is_valid_combination(combination):
                            combinations.append(combination)
        
        return combinations

    def get_five_lines_table(self) -> List[List[int]]:
        all_lines = list(self.line_definitions.values())
        combinations = []
        
        def get_unique_grids(lines: List[List[int]]) -> Set[int]:
            return set().union(*lines)
        
        def is_valid_combination(lines: List[List[int]]) -> bool:
            return len(get_unique_grids(lines)) <= GAME_CONSTRAINTS['max_cells']
        
        for i in range(len(all_lines)):
            for j in range(i + 1, len(all_lines)):
                for k in range(j + 1, len(all_lines)):
                    for l in range(k + 1, len(all_lines)):
                        for m in range(l + 1, len(all_lines)):
                            combination = [all_lines[i], all_lines[j], all_lines[k], all_lines[l], all_lines[m]]
                            if is_valid_combination(combination):
                                combinations.append(combination)
        
        return combinations

    def get_possible_moves(self) -> List[int]:
        return [i for i in range(GAME_CONSTRAINTS['board_size']) if i not in self.board_state]

    def evaluate_move(self, move: int) -> Dict[str, float]:
        temp_state = self.board_state | {move}
        selected_cells = len(temp_state)

        three_line_score = 0
        four_line_score = 0
        five_line_score = 0

        # Check 3-line solutions
        three_line_combinations = self.get_three_lines_table()
        for combination in three_line_combinations:
            required_grids = set().union(*combination)
            not_selected_grids = len([grid for grid in required_grids if grid not in temp_state])
            
            if not_selected_grids + selected_cells <= GAME_CONSTRAINTS['max_cells']:
                score = LINE_SCORES['three_line']['base'] + \
                    LINE_SCORES['three_line']['power_base'] ** \
                    (LINE_SCORES['three_line']['power_exponent'] - (not_selected_grids + selected_cells))
                three_line_score += score
                
                for line in combination:
                    completed_grids = len([grid for grid in line if grid in temp_state])
                    if completed_grids == len(line):
                        three_line_score += IMMEDIATE_BONUSES['complete_line']

        # Check 4-line solutions
        four_line_combinations = self.get_four_lines_table()
        for combination in four_line_combinations:
            required_grids = set().union(*combination)
            not_selected_grids = len([grid for grid in required_grids if grid not in temp_state])
            
            if not_selected_grids + selected_cells <= GAME_CONSTRAINTS['max_cells']:
                score = LINE_SCORES['four_line']['base'] + \
                    LINE_SCORES['four_line']['power_base'] ** \
                    (LINE_SCORES['four_line']['power_exponent'] - (not_selected_grids + selected_cells))
                four_line_score += score

        # Check 5-line solutions
        five_line_combinations = self.get_five_lines_table()
        for combination in five_line_combinations:
            required_grids = set().union(*combination)
            not_selected_grids = len([grid for grid in required_grids if grid not in temp_state])
            
            if not_selected_grids + selected_cells <= GAME_CONSTRAINTS['max_cells']:
                score = LINE_SCORES['five_line']['base'] + \
                    LINE_SCORES['five_line']['power_base'] ** \
                    (LINE_SCORES['five_line']['power_exponent'] - (not_selected_grids + selected_cells))
                five_line_score += score

        # Add points for completed lines
        new_line_completed = False
        for line in self.line_definitions.values():
            completed_grids = len([grid for grid in line if grid in temp_state])
            if completed_grids == len(line) and move in line:
                three_line_score += IMMEDIATE_BONUSES['complete_line']
                new_line_completed = True

        # If no new line completed, check for new 4-cell lines
        if not new_line_completed:
            for line in self.line_definitions.values():
                selected_after_move = len([grid for grid in line if grid in temp_state])
                if move in line:
                    if selected_after_move == 4:
                        four_line_score += IMMEDIATE_BONUSES['four_cell_line']
                    if selected_after_move == 3:
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
        completed_lines = 0
        
        for line in self.line_definitions.values():
            selected_count = len([cell for cell in line if cell in self.board_state])
            if selected_count == len(line):
                completed_lines += 1
        
        return completed_lines

    def get_optimal_move(self) -> Tuple[int, Dict[str, float]]:
        """Get the optimal move and its score.
        
        Returns:
            Tuple[int, Dict[str, float]]: A tuple containing:
                - The best move (0-24)
                - The score dictionary containing 'three_line', 'four_line', 'five_line', and 'total' scores
        """
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