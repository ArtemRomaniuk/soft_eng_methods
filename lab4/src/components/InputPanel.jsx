import styled from "styled-components";

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  color: white;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: ${(props) => (props.active ? "#1e90ff" : "#444")};
  color: white;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${(props) => (props.active ? "#1c81e6" : "#555")};
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #aaa;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  cursor: pointer;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
  background: #1a1a1a;
  color: #2ed573;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 10px;
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  resize: vertical;
  outline: none;

  &:focus {
    border-color: #1e90ff;
  }
`;

export default function InputPanel({
  pointsCount,
  setPointsCount,
  points,
  setCustomPoints,
  showLagrange,
  setShowLagrange,
  showLS,
  setShowLS,
  lsDegree,
  setLsDegree,
}) {
  const handleTextChange = (e) => {
    const text = e.target.value;
    const lines = text.split("\n").filter((line) => line.trim());
    const newPoints = lines.map((line) => {
      const [x, y] = line.split(",").map((v) => parseFloat(v.trim()));
      if (isNaN(x) || isNaN(y)) throw new Error("Invalid input");
      return { x, y };
    });
    setCustomPoints(newPoints);
  };

  const pointsText = points.map((p) => `${p.x}, ${p.y}`).join("\n");

  return (
    <Panel>
      <FormGroup>
        <Label>PRESETS</Label>
        <ButtonGroup>
          {[5, 10, 20].map((n) => (
            <Button
              key={n}
              $active={pointsCount === n}
              onClick={() => setPointsCount(n)}
            >
              {n}
            </Button>
          ))}
        </ButtonGroup>
      </FormGroup>

      <FormGroup>
        <Label>MANUAL DATA (x, y)</Label>
        <TextArea
          defaultValue={pointsText}
          key={pointsCount}
          onChange={handleTextChange}
          placeholder="x, y"
        />
      </FormGroup>

      <FormGroup>
        <Label>VISUALIZATION</Label>
        <ToggleContainer onClick={() => setShowLagrange(!showLagrange)}>
          <Checkbox type="checkbox" checked={showLagrange} readOnly />
          <span>Lagrange</span>
        </ToggleContainer>
        <ToggleContainer onClick={() => setShowLS(!showLS)}>
          <Checkbox type="checkbox" checked={showLS} readOnly />
          <span>LSM (LS)</span>
        </ToggleContainer>
      </FormGroup>

      {showLS && (
        <FormGroup>
          <Label>LSM DEGREE: {lsDegree}</Label>
          <input
            type="range"
            min="1"
            max="10"
            value={lsDegree}
            onChange={(e) => setLsDegree(parseInt(e.target.value))}
          />
        </FormGroup>
      )}
    </Panel>
  );
}
