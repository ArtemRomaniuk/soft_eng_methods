function solveGaussian(matrix) {
  const n = matrix.length;

  for (let i = 0; i < n; i++) {
    let max = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(matrix[j][i]) > Math.abs(matrix[max][i])) {
        max = j;
      }
    }

    [matrix[i], matrix[max]] = [matrix[max], matrix[i]];

    if (Math.abs(matrix[i][i]) < 1e-10) {
      continue;
    }

    for (let j = i + 1; j < n; j++) {
      const factor = matrix[j][i] / matrix[i][i];
      for (let k = i; k <= n; k++) {
        matrix[j][k] -= factor * matrix[i][k];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += matrix[i][j] * x[j];
    }
    if (Math.abs(matrix[i][i]) > 1e-10) {
      x[i] = (matrix[i][n] - sum) / matrix[i][i];
    } else {
      x[i] = 0;
    }
  }
  return x;
}

export function getLSCoefficients(points, degree) {
  const n = points.length;
  const m = Math.min(degree, n - 1);
  const A = Array.from({ length: m + 1 }, () => new Array(m + 2).fill(0));

  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= m; j++) {
      let sumX = 0;
      for (let k = 0; k < n; k++) {
        sumX += Math.pow(points[k].x, i + j);
      }
      A[i][j] = sumX;
    }

    let sumY = 0;
    for (let k = 0; k < n; k++) {
      sumY += points[k].y * Math.pow(points[k].x, i);
    }
    A[i][m + 1] = sumY;
  }

  return solveGaussian(A);
}

export function getLSFunc(points, degree = 2) {
  if (!points || points.length === 0) return () => 0;

  try {
    const coeffs = getLSCoefficients(points, degree);
    return (x) => {
      return coeffs.reduce((sum, c, i) => sum + c * Math.pow(x, i), 0);
    };
  } catch (err) {
    console.error("LSM Error:", err);
    return () => 0;
  }
}
