export default function dp(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const currentWeight = weights[i - 1];
    const currentValue = values[i - 1];

    for (let w = 0; w <= capacity; w++) {
      if (currentWeight <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - currentWeight] + currentValue,
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  let currentW = capacity;
  const selectedItems = [];
  for (let i = n; i > 0; i--) {
    if (dp[i][currentW] !== dp[i - 1][currentW]) {
      selectedItems.push(i - 1);
      currentW -= weights[i - 1];
    }
  }

  return {
    maxValue: dp[n][capacity],
    dp,
    selectedItems: selectedItems.reverse(),
  };
}
