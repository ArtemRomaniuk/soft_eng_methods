import { PanelContainer, FormGroup, DataInfo } from "./InputPanel.styles";

export default function InputPanel({
  capacity,
  weights,
  values,
  handleCapacityChange,
  handleWeightsChange,
  handleValuesChange,
}) {
  const parseArray = (str) => {
    return str
      .split(",")
      .map((val) => val.trim())
      .filter((val) => val !== "")
      .map((val) => parseInt(val))
      .filter((val) => !isNaN(val));
  };

  return (
    <PanelContainer>
      <h2>Input Data</h2>

      <FormGroup>
        <label htmlFor="capacity">Knapsack Capacity (W)</label>
        <input
          id="capacity"
          type="number"
          value={capacity}
          onChange={handleCapacityChange}
          placeholder="Enter capacity"
          min="1"
        />
      </FormGroup>

      <FormGroup>
        <label htmlFor="weights">Weights (w[i])</label>
        <textarea
          id="weights"
          value={weights}
          onChange={handleWeightsChange}
          placeholder="Enter weights separated by commas (e.g., 1, 2, 3)"
          rows="2"
        />
        <small>Format: comma separated values</small>
      </FormGroup>

      <FormGroup>
        <label htmlFor="values">Values (v[i])</label>
        <textarea
          id="values"
          value={values}
          onChange={handleValuesChange}
          placeholder="Enter values separated by commas (e.g., 4, 5, 6)"
          rows="2"
        />
        <small>Format: comma separated values</small>
      </FormGroup>

      <DataInfo>
        <p>
          <strong>Items:</strong> {parseArray(weights).length}
        </p>
        <p>
          <strong>Capacity:</strong> {capacity}
        </p>
        <p>
          <strong>Weights:</strong> [{parseArray(weights).join(", ")}]
        </p>
        <p>
          <strong>Values:</strong> [{parseArray(values).join(", ")}]
        </p>
      </DataInfo>
    </PanelContainer>
  );
}
