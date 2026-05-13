import * as math from 'mathjs';

export const MathEngine = {
    lagrange(points, x) {
        let result = 0;
        const n = points.length;
        for (let i = 0; i < n; i++) {
            let term = points[i].y;
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    term *= (x - points[j].x) / (points[i].x - points[j].x);
                }
            }
            result += term;
        }
        return result;
    },
    newton(points, x) {
        const n = points.length;
        if (n === 0) return 0;
        const f = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) f[i][0] = points[i].y;
        for (let j = 1; j < n; j++) {
            for (let i = 0; i < n - j; i++) {
                f[i][j] = (f[i + 1][j - 1] - f[i][j - 1]) / (points[i + j].x - points[i].x);
            }
        }
        let result = f[0][0];
        let product = 1;
        for (let i = 1; i < n; i++) {
            product *= (x - points[i - 1].x);
            result += f[0][i] * product;
        }
        return result;
    },
    lsm(points, m) {
        const n = points.length;
        if (n <= m) m = n - 1;
        const A_data = [];
        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = 0; j <= m; j++) row.push(Math.pow(points[i].x, j));
            A_data.push(row);
        }
        const A = math.matrix(A_data);
        const y = math.matrix(points.map(p => p.y));
        const qr = math.qr(A);
        const Q = qr.Q;
        const R = qr.R;
        const QT = math.transpose(Q);
        const QTy = math.multiply(QT, y);
        const c = new Array(m + 1).fill(0);
        const R_data = R.toArray();
        const QTy_data = QTy.toArray();
        for (let i = m; i >= 0; i--) {
            let sum = 0;
            for (let j = i + 1; j <= m; j++) sum += R_data[i][j] * c[j];
            const diag = R_data[i][i];
            c[i] = Math.abs(diag) > 1e-10 ? (QTy_data[i] - sum) / diag : 0;
        }
        return c;
    },
    evaluateLSM(coefficients, x) {
        return coefficients.reduce((sum, coeff, i) => sum + coeff * Math.pow(x, i), 0);
    },
    calculateMetrics(points, coefficients) {
        const n = points.length;
        if (n === 0) return { rmse: 0, r2: 0 };
        const y_actual = points.map(p => p.y);
        const y_pred = points.map(p => this.evaluateLSM(coefficients, p.x));
        let rss = 0;
        for (let i = 0; i < n; i++) rss += Math.pow(y_actual[i] - y_pred[i], 2);
        const rmse = Math.sqrt(rss / n);
        const y_mean = y_actual.reduce((a, b) => a + b, 0) / n;
        let tss = 0;
        for (let i = 0; i < n; i++) tss += Math.pow(y_actual[i] - y_mean, 2);
        const r2 = 1 - (rss / tss);
        return { rmse, r2 };
    }
};
