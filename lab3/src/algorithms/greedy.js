export default function greedy(weights, values, capacity) {
  const n = weights.length;
  const items = [];
  for (let i = 0; i < n; i++) {
    items.push({
      id: i,
      weight: weights[i],
      value: values[i],
      ratio: values[i] / weights[i],
    });
  }

  
  const sortedItems = [...items].sort((a, b) => b.ratio - a.ratio);

  let currentWeight = 0;
  let maxValue = 0;
  const selectedItems = [];
  const steps = [];

  for (const item of sortedItems) {
    const step = {
      item,
      added: false,
      remainingCapacity: capacity - currentWeight,
    };

    if (currentWeight + item.weight <= capacity) {
      currentWeight += item.weight;
      maxValue += item.value;
      selectedItems.push(item.id);
      step.added = true;
    }
    
    step.currentWeight = currentWeight;
    step.currentValue = maxValue;
    steps.push(step);
  }

  return {
    maxValue,
    selectedItems,
    sortedItems,
    steps,
  };
}
