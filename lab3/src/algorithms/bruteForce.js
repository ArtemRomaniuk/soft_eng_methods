export default function bruteForce(weights, values, capacity) {
  const n = weights.length;
  let maxValue = 0;
  let bestCombination = [];
  const history = [];

  // Generate all 2^n combinations
  for (let i = 0; i < Math.pow(2, n); i++) {
    const currentCombination = [];
    let currentWeight = 0;
    let currentValue = 0;

    for (let j = 0; j < n; j++) {
      if ((i >> j) & 1) {
        currentCombination.push(j);
        currentWeight += weights[j];
        currentValue += values[j];
      }
    }

    if (currentWeight <= capacity) {
      if (currentValue > maxValue) {
        maxValue = currentValue;
        bestCombination = [...currentCombination];
      }
      history.push({
        combination: [...currentCombination],
        value: currentValue,
        weight: currentWeight,
        isBest: false,
      });
    }
  }

  // Mark the best in history
  history.forEach((item) => {
    if (item.value === maxValue && item.combination.length === bestCombination.length) {
      // Simple check, could be more robust
      const isMatch = item.combination.every((v, idx) => v === bestCombination[idx]);
      if (isMatch) item.isBest = true;
    }
  });

  return {
    maxValue,
    selectedItems: bestCombination,
    history,
  };
}
