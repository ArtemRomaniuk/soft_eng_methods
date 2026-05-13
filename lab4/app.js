/**
 * Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const renderer = new ChartRenderer('chart');
    let currentPoints = [];
    let lsmCoefficients = [];

    // UI Elements
    const pointsInput = document.getElementById('points-input');
    const applyBtn = document.getElementById('apply-points');
    const randomBtn = document.getElementById('random-points');
    const modeSelect = document.getElementById('mode-select');
    const lsmSettings = document.getElementById('lsm-settings');
    const animationBtn = document.getElementById('run-animation');
    const rmseVal = document.getElementById('rmse-val');
    const r2Val = document.getElementById('r2-val');

    // Default points from the report
    const defaultPointsStr = "0, 1\n1, 3\n2, 2\n3, 5\n4, 4";
    pointsInput.value = defaultPointsStr;

    function parsePoints() {
        const text = pointsInput.value;
        const lines = text.trim().split('\n');
        const points = [];
        
        lines.forEach(line => {
            const parts = line.split(',').map(p => parseFloat(p.trim()));
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                points.push({ x: parts[0], y: parts[1] });
            }
        });

        // Sort points by X for better interpolation results
        return points.sort((a, b) => a - b);
    }

    function updateApp(animated = false) {
        currentPoints = parsePoints();
        if (currentPoints.length === 0) return;

        renderer.updateScales(currentPoints);
        renderer.renderPoints(currentPoints);
        renderer.clearPaths();

        const mode = modeSelect.value;
        const lsmDegree = parseInt(document.querySelector('input[name="lsm-degree"]:checked').value);
        const legendItems = [];

        if (mode === 'interpolation' || mode === 'all') {
            // Using Newton for interpolation as it's efficient for additions
            renderer.renderCurve('interp', currentPoints, (x) => MathEngine.newton(currentPoints, x), 'interp-path', animated);
            legendItems.push({ name: 'Інтерполяція (Ньютон)', color: 'var(--interp-color)' });
        }

        if (mode === 'lsm' || mode === 'all') {
            lsmCoefficients = MathEngine.lsm(currentPoints, lsmDegree);
            renderer.renderCurve('lsm', currentPoints, (x) => MathEngine.evaluateLSM(lsmCoefficients, x), 'lsm-path', animated);
            renderer.renderResiduals(currentPoints, (x) => MathEngine.evaluateLSM(lsmCoefficients, x), animated);
            
            const metrics = MathEngine.calculateMetrics(currentPoints, lsmCoefficients);
            rmseVal.textContent = metrics.rmse.toFixed(4);
            r2Val.textContent = metrics.r2.toFixed(4);
            
            legendItems.push({ name: `МНК (ступінь ${lsmDegree})`, color: 'var(--lsm-color)' });
        } else {
            rmseVal.textContent = '-';
            r2Val.textContent = '-';
        }

        renderer.updateLegend(legendItems);
    }

    async function runStepByStepAnimation() {
        const points = parsePoints();
        if (points.length < 2) return;

        renderer.updateScales(points);
        renderer.clearPaths();
        renderer.g.select(".points-group").selectAll("*").remove();

        const mode = modeSelect.value;
        const lsmDegree = parseInt(document.querySelector('input[name="lsm-degree"]:checked').value);

        if (mode === 'interpolation' || mode === 'all') {
            // Interpolation animation: add points one by one
            for (let i = 1; i <= points.length; i++) {
                const subPoints = points.slice(0, i);
                renderer.renderPoints(subPoints);
                if (i >= 2) {
                    renderer.renderCurve('interp', subPoints, (x) => MathEngine.newton(subPoints, x), 'interp-path');
                }
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }

        if (mode === 'lsm' || mode === 'all') {
            // LSM animation: curve "growing" (already handled by path animation in renderer, 
            // but we can add more specific logic here if needed)
            updateApp(true);
        }
    }

    // Event Listeners
    applyBtn.addEventListener('click', () => updateApp(false));
    
    randomBtn.addEventListener('click', () => {
        let pointsStr = "";
        for (let i = 0; i < 6; i++) {
            pointsStr += `${i}, ${(Math.random() * 10).toFixed(2)}\n`;
        }
        pointsInput.value = pointsStr.trim();
        updateApp(false);
    });

    modeSelect.addEventListener('change', () => {
        lsmSettings.style.display = (modeSelect.value === 'interpolation') ? 'none' : 'block';
        updateApp(false);
    });

    document.querySelectorAll('input[name="lsm-degree"]').forEach(radio => {
        radio.addEventListener('change', () => updateApp(false));
    });

    animationBtn.addEventListener('click', runStepByStepAnimation);

    // Initial run
    updateApp();
});
