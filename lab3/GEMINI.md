# Knapsack Problem Visualization Project

## Tech Stack

- **Framework:** React (Vite)
- **Styling:** `styled-components`
- **Visualization:** `d3.js` (Required by the laboratory specification)

## Architectural Guidelines

- **Algorithm Implementations:** Logic for algorithms (Brute Force, Recursive, DP, Greedy, Branch and Bound) lives in `src/algorithms/`.
- **Visualization Data:** Algorithms must return not just the final result, but also intermediate states or data structures required for visualization (e.g., the full 2D array for DP, history of choices for Greedy, or tree structures for Branch and Bound).
- **Styling Rules:** Always use `styled-components` for new UI elements. Avoid standard CSS classes to maintain consistency.
- **UI Structure:** The application relies on a tabbed interface where each tab is responsible for executing and visualizing its respective algorithm.
