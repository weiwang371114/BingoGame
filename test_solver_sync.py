import subprocess
import json
import sys
from typing import Set, List, Dict, Tuple
import random

# Add evaluation directory to Python path
sys.path.append('evaluation')

def evaluate_board_js(board_state: Set[int]) -> Dict[int, Dict[str, float]]:
    """Use the JavaScript solver to evaluate the board state"""
    board_str = ','.join(map(str, sorted(board_state))) if board_state else "empty"
    try:
        result = subprocess.run(['node', 'solver_bridge.js', board_str], 
                              capture_output=True, text=True, check=True)
        return json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error running JS solver: {e}")
        print(f"stderr: {e.stderr}")
        raise

def get_optimal_move_js(board_state: Set[int]) -> Tuple[int, Dict[str, float]]:
    """Get the optimal move using the JavaScript solver"""
    evaluations = evaluate_board_js(board_state)
    if not evaluations:
        return -1, {"total": 0, "threeLine": 0, "fourLine": 0, "fiveLine": 0}
    best_move = max(evaluations.items(), key=lambda x: float(x[1]["total"]))
    return int(best_move[0]), best_move[1]

def format_py_score(score: Dict) -> Dict[str, float]:
    """Format Python solver score to match JavaScript format"""
    return {
        "total": float(score["total"]),
        "threeLine": float(score["three_line"]),
        "fourLine": float(score["four_line"]),
        "fiveLine": float(score["five_line"])
    }

def get_optimal_move_py(board_state: Set[int]) -> Tuple[int, Dict[str, float]]:
    """Get the optimal move using the Python solver"""
    from solver import BingoSolver
    solver = BingoSolver(board_state)
    move, score = solver.get_optimal_move()
    if move == -1:
        return move, {"total": 0, "threeLine": 0, "fourLine": 0, "fiveLine": 0}
    return move, format_py_score(score)

def generate_test_cases() -> List[Set[int]]:
    """Generate a variety of test board states"""
    test_cases = []
    
    # Empty board
    test_cases.append(set())
    
    # Single moves
    test_cases.append({12})  # Center
    test_cases.append({0})   # Corner
    test_cases.append({7})   # Edge
    
    # Early game states (2-4 moves)
    test_cases.append({0, 12})
    test_cases.append({0, 12, 24})
    test_cases.append({0, 12, 24, 6})
    
    # Mid game states (5-8 moves)
    test_cases.append({0, 4, 12, 20, 24})  # Corners + center
    test_cases.append({0, 1, 2, 5, 6, 7})  # Cluster
    test_cases.append({0, 4, 12, 16, 20, 24, 8})  # Diagonal + extra
    
    # Late game states (9-11 moves)
    test_cases.append({0, 1, 2, 3, 4, 5, 6, 7, 8})  # Almost complete line
    test_cases.append({0, 4, 8, 12, 16, 20, 21, 22, 23, 24})  # Complex pattern

    test_cases.append({0, 1, 2, 3, 4, 8, 12, 16, 17, 20})  # Almost complete line.
    
    return test_cases

def compare_moves(board_state: Set[int]) -> Dict:
    """Compare moves suggested by both solvers for a given board state"""
    try:
        js_move, js_score = get_optimal_move_js(board_state)
    except Exception as e:
        print(f"Error getting JS move: {e}")
        js_move, js_score = -1, {"total": 0, "threeLine": 0, "fourLine": 0, "fiveLine": 0}
    
    try:
        py_move, py_score = get_optimal_move_py(board_state)
    except Exception as e:
        print(f"Error getting Python move: {e}")
        py_move, py_score = -1, {"total": 0, "threeLine": 0, "fourLine": 0, "fiveLine": 0}
    
    return {
        "board_state": sorted(list(board_state)),
        "js_move": js_move,
        "js_score": js_score,
        "py_move": py_move,
        "py_score": py_score,
        "match": js_move == py_move
    }

def run_comparison_tests():
    """Run comparison tests and print results"""
    test_cases = generate_test_cases()
    results = []
    matches = 0
    total = len(test_cases)
    
    print("\nRunning solver comparison tests...")
    print("=" * 60)
    
    for board_state in test_cases:
        result = compare_moves(board_state)
        results.append(result)
        if result["match"]:
            matches += 1
        
        print(f"\nBoard state: {result['board_state']}")
        print(f"JS Solver  -> Move: {result['js_move']}, Score: {result['js_score']}")
        print(f"PY Solver  -> Move: {result['py_move']}, Score: {result['py_score']}")
        print(f"Match: {'✓' if result['match'] else '✗'}")
        print("-" * 60)
    
    print(f"\nSummary:")
    print(f"Total test cases: {total}")
    print(f"Matching moves: {matches}")
    print(f"Different moves: {total - matches}")
    print(f"Match rate: {(matches/total)*100:.1f}%")

if __name__ == "__main__":
    run_comparison_tests() 