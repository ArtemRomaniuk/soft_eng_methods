export default function recursive(weights, values, capacity) {
  const n = weights.length;

  function solve(i, cap) {
    if (i === n || cap === 0) {
      return {
        value: 0,
        items: [],
        tree: { i, cap, type: "leaf", children: [] },
      };
    }

    // Option 1: Skip
    const resSkip = solve(i + 1, cap);

    // Option 2: Take
    let resTake = { value: -1, items: [], tree: null };
    if (weights[i] <= cap) {
      resTake = solve(i + 1, cap - weights[i]);
      resTake.value += values[i];
      resTake.items = [i, ...resTake.items];
    }

    const isTake = resTake.value > resSkip.value;
    const best = isTake ? resTake : resSkip;

    const treeNode = {
      i,
      cap,
      isBest: true,
      children: [
        { ...resSkip.tree, type: "skip", isBest: !isTake },
        ...(resTake.tree
          ? [{ ...resTake.tree, type: "take", isBest: isTake }]
          : []),
      ],
    };

    return {
      value: best.value,
      items: best.items,
      tree: treeNode,
    };
  }

  const result = solve(0, capacity);

  // Mark the best path throughout the tree
  function markPath(node, isBest) {
    node.isBest = isBest;
    if (node.children) {
      node.children.forEach((child) => {
        // Child is best if it was marked as the choice and its parent is also part of the best path
        markPath(child, isBest && child.isBest);
      });
    }
  }

  markPath(result.tree, true);

  return {
    maxValue: result.value,
    selectedItems: result.items,
    callTree: result.tree,
  };
}
