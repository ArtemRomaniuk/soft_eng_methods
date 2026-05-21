export function lagrange(points, x) {
  let result = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    let term = points[i].y;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const denominator = points[i].x - points[j].x;
        if (denominator !== 0) {
          term *= (x - points[j].x) / denominator;
        }
      }
    }
    result += term;
  }

  return result;
}

export function getLagrangeFunc(points) {
  return (x) => lagrange(points, x);
}
