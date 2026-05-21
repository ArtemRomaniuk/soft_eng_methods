import { useState, useMemo } from "react";
import styled from "styled-components";
import Chart from "./components/Chart";
import ResidualsChart from "./components/ResidualsChart";
import InputPanel from "./components/InputPanel";
import MetricsPanel from "./components/MetricsPanel";

const AppContainer = styled.div`
  min-height: 100vh;
  background: #121212;
  color: #e0e0e0;
  padding: 40px;
  font-family:
    "Inter",
    -apple-system,
    system-ui,
    sans-serif;
`;

const Header = styled.header`
  margin-bottom: 40px;
  text-align: left;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
`;

const Title = styled.h1`
  margin: 0;
  font-weight: 700;
  font-size: 2.5rem;
  color: #1e90ff;
`;

const Layout = styled.main`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const VisualizationArea = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PRESETS = {
  5: [
    { x: 1, y: 1.0 },
    { x: 2, y: 4.0 },
    { x: 3, y: 9.0 },
    { x: 4, y: 16.0 },
    { x: 5, y: 25.0 },
  ],
  10: [
    { x: 0, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 7 },
    { x: 4, y: 11 },
    { x: 5, y: 16 },
    { x: 6, y: 22 },
    { x: 7, y: 29 },
    { x: 8, y: 37 },
  ],
  20: [
    { x: 0, y: 1.5 },
    { x: 0.5, y: 1.8 },
    { x: 1, y: 2.5 },
    { x: 1.5, y: 3.6 },
    { x: 2, y: 5.1 },
    { x: 2.5, y: 7.0 },
    { x: 3, y: 9.3 },
    { x: 3.5, y: 12.0 },
    { x: 4, y: 15.1 },
    { x: 4.5, y: 18.6 },
    { x: 5, y: 22.5 },
    { x: 5.5, y: 26.8 },
    { x: 6, y: 31.5 },
    { x: 6.5, y: 36.6 },
    { x: 7, y: 42.1 },
    { x: 7.5, y: 48.0 },
    { x: 8, y: 54.3 },
    { x: 8.5, y: 61.0 },
    { x: 9, y: 68.1 },
    { x: 9.5, y: 75.6 },
  ],
};

export default function App() {
  const [pointsCount, setPointsCount] = useState(5);
  const [customPoints, setCustomPoints] = useState(null);
  const [showLagrange, setShowLagrange] = useState(true);
  const [showLS, setShowLS] = useState(true);
  const [lsDegree, setLsDegree] = useState(2);
  const [animateKey, setAnimateKey] = useState(0);

  const points = useMemo(() => {
    return customPoints || PRESETS[pointsCount] || PRESETS[5];
  }, [pointsCount, customPoints]);

  const handlePresetChange = (n) => {
    setPointsCount(n);
    setCustomPoints(null);
    setAnimateKey((prev) => prev + 1);
  };

  const triggerAnimation = () => setAnimateKey((prev) => prev + 1);

  return (
    <AppContainer>
      <Header>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title>Lagrange & LSM Analysis</Title>
          </div>
          <button
            onClick={triggerAnimation}
            style={{
              padding: "12px 24px",
              background: "#1e90ff",
              border: "none",
              borderRadius: "6px",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(30, 144, 255, 0.3)",
            }}
          >
            RUN ANIMATION
          </button>
        </div>
      </Header>

      <Layout>
        <Sidebar>
          <InputPanel
            pointsCount={pointsCount}
            setPointsCount={handlePresetChange}
            points={points}
            setCustomPoints={setCustomPoints}
            showLagrange={showLagrange}
            setShowLagrange={setShowLagrange}
            showLS={showLS}
            setShowLS={setShowLS}
            lsDegree={lsDegree}
            setLsDegree={setLsDegree}
          />
          <MetricsPanel points={points} lsDegree={lsDegree} />
        </Sidebar>

        <VisualizationArea>
          <Chart
            key={`chart-${animateKey}`}
            points={points}
            showLagrange={showLagrange}
            showLS={showLS}
            lsDegree={lsDegree}
            animate={true}
          />
          <ResidualsChart
            key={`res-${animateKey}`}
            points={points}
            showLagrange={showLagrange}
            showLS={showLS}
            lsDegree={lsDegree}
            animate={true}
          />
        </VisualizationArea>
      </Layout>
    </AppContainer>
  );
}
