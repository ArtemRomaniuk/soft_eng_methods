export default function branchAndBound(weights, values, capacity) {
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

  // Sort items by ratio (Value/Weight) descending
  const sortedItems = [...items].sort((a, b) => b.ratio - a.ratio);

  // Upper bound function using Fractional Knapsack
  function getBound(level, currentWeight, currentValue) {
    if (currentWeight >= capacity) return 0;

    let bound = currentValue;
    let totalWeight = currentWeight;
    let j = level + 1;

    while (j < n && totalWeight + sortedItems[j].weight <= capacity) {
      totalWeight += sortedItems[j].weight;
      bound += sortedItems[j].value;
      j++;
    }

    // Add fractional part of next item
    if (j < n) {
      bound += (capacity - totalWeight) * sortedItems[j].ratio;
    }

    return bound;
  }

  const nodes = [];
  const queue = [];

  // Root node
  const root = {
    level: -1,
    weight: 0,
    value: 0,
    bound: getBound(-1, 0, 0),
    items: [],
    id: 0,
    parentId: null,
    type: "root",
    isPruned: false,
    isBest: false,
  };

  queue.push(root);
  nodes.push(root);

  let maxValue = 0;
  let bestNodeId = 0;
  let nodeIdCounter = 1;

  while (queue.length > 0) {
    // Priority Queue: process node with highest bound first
    queue.sort((a, b) => b.bound - a.bound);
    const u = queue.shift();

    // If bound is less than current max, prune it
    if (u.bound <= maxValue) {
      u.isPruned = true;
      continue;
    }

    if (u.level === n - 1) continue;

    const nextLevel = u.level + 1;
    const currentItem = sortedItems[nextLevel];

    // Left child: Take current item
    const leftWeight = u.weight + currentItem.weight;
    const leftValue = u.value + currentItem.value;
    const leftItems = [...u.items, currentItem.id];
    const leftBound = getBound(nextLevel, leftWeight, leftValue);

    const leftNode = {
      level: nextLevel,
      weight: leftWeight,
      value: leftValue,
      bound: leftBound,
      items: leftItems,
      id: nodeIdCounter++,
      parentId: u.id,
      type: "take",
      itemInfo: {
        id: currentItem.id,
        w: currentItem.weight,
        v: currentItem.value
      },
      isPruned: false,
      isBest: false,
    };

    if (leftWeight <= capacity) {
      if (leftValue > maxValue) {
        maxValue = leftValue;
        bestNodeId = leftNode.id;
      }
      
      if (leftBound > maxValue) {
        queue.push(leftNode);
      } else {
        leftNode.isPruned = true;
      }
    } else {
      leftNode.isPruned = true;
      leftNode.bound = 0; // Invalid state
    }
    nodes.push(leftNode);

    // Right child: Skip current item
    const rightBound = getBound(nextLevel, u.weight, u.value);
    const rightNode = {
      level: nextLevel,
      weight: u.weight,
      value: u.value,
      bound: rightBound,
      items: u.items,
      id: nodeIdCounter++,
      parentId: u.id,
      type: "skip",
      itemInfo: {
        id: currentItem.id,
        w: currentItem.weight,
        v: currentItem.value
      },
      isPruned: false,
      isBest: false,
    };

    if (rightBound > maxValue) {
      queue.push(rightNode);
    } else {
      rightNode.isPruned = true;
    }
    nodes.push(rightNode);
  }

  // Backtrack to mark the best path
  let current = nodes.find(n => n.id === bestNodeId);
  const selectedItems = current ? current.items : [];
  
  while (current) {
    current.isBest = true;
    current = nodes.find(n => n.id === current.parentId);
  }

  return {
    maxValue,
    selectedItems,
    treeNodes: nodes,
  };
}
