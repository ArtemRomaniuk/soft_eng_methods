import styled from "styled-components";
import { getLSFunc } from "../utils/ls";

const Panel = styled.div`
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  color: white;
  border-left: 4px solid #1e90ff;
`;

const Title = styled.h3`
  margin: 0 0 15px 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #aaa;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #333;
  font-size: 13px;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: #888;
`;

const Value = styled.span`
  font-family: "JetBrains Mono", "Fira Code", monospace;
  color: #2ed573;
  font-weight: 500;
`;

const MethodGroup = styled.div`
  margin-top: 15px;
  &:first-child {
    margin-top: 0;
  }
`;

const MethodTitle = styled.div`
  font-size: 11px;
  color: #1e90ff;
  margin-bottom: 5px;
  font-weight: bold;
`;

export default function MetricsPanel({ points, lsDegree }) {
  const calculateMetrics = (predictFunc) => {
    const n = points.length;
    if (n === 0) return { rmse: 0, r2: 0 };

    const yValues = points.map((p) => p.y);
    const meanY = yValues.reduce((a, b) => a + b, 0) / n;

    let ssRes = 0;
    let ssTot = 0;

    points.forEach((p) => {
      const prediction = predictFunc(p.x);
      ssRes += Math.pow(p.y - prediction, 2);
      ssTot += Math.pow(p.y - meanY, 2);
    });

    const mse = ssRes / n;
    const rmse = Math.sqrt(mse);
    const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

    return { rmse, r2 };
  };

  const lsMetrics = calculateMetrics(getLSFunc(points, lsDegree));

  return (
    <Panel>
      <Title>Model Performance</Title>

      <MethodGroup style={{ marginTop: "20px" }}>
        <MethodTitle>LSM (DEGREE {lsDegree})</MethodTitle>
        <MetricRow>
          <Label>RMSE</Label>
          <Value>{lsMetrics.rmse.toFixed(6)}</Value>
        </MetricRow>
        <MetricRow>
          <Label>R²</Label>
          <Value>{lsMetrics.r2.toFixed(6)}</Value>
        </MetricRow>
      </MethodGroup>
    </Panel>
  );
}
