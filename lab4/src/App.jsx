import { useState, useMemo, useEffect } from "react";
import Chart from "./components/Chart";
import { MathEngine } from "./math_engine";
import "./index.css";

function App() {
  const [pointsText, setPointsText] = useState("0, 1\n1, 3\n2, 2\n3, 5\n4, 4");
  const [mode, setMode] = useState("interpolation");
  const [lsmDegree, setLsmDegree] = useState(2);
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const points = useMemo(() => {
    const lines = pointsText.trim().split("\n");
    const pts = [];
    lines.forEach((line) => {
      const parts = line.split(",").map((p) => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]))
        pts.push({ x: parts[0], y: parts[1] });
    });
    return pts.sort((a, b) => a - b);
  }, [pointsText]);

  const lsmCoefficients = useMemo(() => {
    if ((mode === "lsm" || mode === "all") && points.length > 0)
      return MathEngine.lsm(points, lsmDegree);
    return [];
  }, [points, mode, lsmDegree]);

  const metrics = useMemo(() => {
    if ((mode === "lsm" || mode === "all") && points.length > 0)
      return MathEngine.calculateMetrics(points, lsmCoefficients);
    return { rmse: 0, r2: 0 };
  }, [points, lsmCoefficients, mode]);

  const handleRandomData = () => {
    let str = "";
    for (let i = 0; i < 6; i++)
      str += `${i}, ${(Math.random() * 10).toFixed(2)}\n`;
    setPointsText(str.trim());
    setIsAnimating(false);
  };

  const handleRunAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(1);
  };

  useEffect(() => {
    if (isAnimating && (mode === "interpolation" || mode === "all")) {
      if (animationStep <= points.length) {
        const timer = setTimeout(
          () => setAnimationStep((prev) => prev + 1),
          800,
        );
        return () => clearTimeout(timer);
      } else setIsAnimating(false);
    } else if (isAnimating && mode === "lsm") {
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, animationStep, points.length, mode]);

  const displayedPoints =
    isAnimating &&
    (mode === "interpolation" || mode === "all") &&
    animationStep > 0
      ? points.slice(0, Math.min(animationStep, points.length))
      : points;

  return (
    <div className="container">
      <header>
        <h1>Апроксимація функцій</h1>
        <p>Методи інтерполяції (Лагранж, Ньютон) та МНК </p>
      </header>
      <main>
        <section className="controls">
          <div className="card">
            <h3>Вхідні дані</h3>
            <div className="input-group">
              <label htmlFor="points-input">
                Точки (x, y через кому, по одній парі на рядок):
              </label>
              <textarea
                id="points-input"
                rows="6"
                value={pointsText}
                onChange={(e) => {
                  setPointsText(e.target.value);
                  setIsAnimating(false);
                }}
              />
            </div>
            <div className="button-group">
              <button id="random-points" onClick={handleRandomData}>
                Випадкові дані
              </button>
            </div>
          </div>
          <div className="card">
            <h3>Налаштування методів</h3>
            <div className="method-select">
              <label>Режим відображення:</label>
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setIsAnimating(false);
                }}
              >
                <option value="interpolation">Інтерполяція</option>
                <option value="lsm">МНК</option>
                <option value="all">Усі методи</option>
              </select>
            </div>
            {mode !== "interpolation" && (
              <div className="settings-group">
                <label>Ступінь полінома МНК (m):</label>
                <div className="radio-group">
                  {[2, 3, 4].map((deg) => (
                    <label key={deg}>
                      <input
                        type="radio"
                        name="lsm-degree"
                        value={deg}
                        checked={lsmDegree === deg}
                        onChange={() => {
                          setLsmDegree(deg);
                          setIsAnimating(false);
                        }}
                      />{" "}
                      {deg}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="animation-control">
              <button
                id="run-animation"
                onClick={handleRunAnimation}
                disabled={isAnimating || points.length < 2}
              >
                {isAnimating ? "Анімація..." : "Запустити анімацію"}
              </button>
            </div>
          </div>
          <div className="card metrics">
            <h3>Метрики якості (МНК)</h3>
            <div id="metrics-display">
              <p>
                RMSE:{" "}
                <span>
                  {mode !== "interpolation" && metrics.rmse
                    ? metrics.rmse.toFixed(4)
                    : "-"}
                </span>
              </p>
              <p>
                R²:{" "}
                <span>
                  {mode !== "interpolation" && metrics.r2
                    ? metrics.r2.toFixed(4)
                    : "-"}
                </span>
              </p>
            </div>
          </div>
        </section>
        <section className="visualization">
          <Chart
            points={displayedPoints}
            mode={mode}
            lsmDegree={lsmDegree}
            lsmCoefficients={lsmCoefficients}
            isAnimating={isAnimating}
          />
        </section>
      </main>
    </div>
  );
}
export default App;
