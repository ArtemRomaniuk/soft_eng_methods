import { useState } from "react";
import "./App.css";
import TabNav from "@components/Tab";
import InputPanel from "@components/InputPanel";
import DPTable from "@components/DPTable";
import BruteForceViz from "@components/BruteForceViz/BruteForceViz";
import RecursiveViz from "@components/RecursiveViz/RecursiveViz";
import GreedyViz from "@components/GreedyViz/GreedyViz";
import BranchAndBoundViz from "@components/BranchAndBoundViz/BranchAndBoundViz";

const TAB_CONTENT = [
  { id: 1, label: "Brute force", name: "bruteForce" },
  { id: 2, label: "Recursive", name: "recursive" },
  { id: 3, label: "Dynamic", name: "dynamic" },
  { id: 4, label: "Greedy", name: "greedy" },
  { id: 5, label: "Branch and bound", name: "branchAndBound" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(3);
  const [capacity, setCapacity] = useState("19");
  const [weights, setWeights] = useState("6, 8, 7, 1, 10, 9, 5, 3, 2");
  const [values, setValues] = useState("3, 7, 13, 4, 11, 13, 8, 10, 9");

  const handleCapacityChange = (e) => {
    setCapacity(e.target.value);
  };

  const handleWeightsChange = (e) => {
    setWeights(e.target.value);
  };

  const handleValuesChange = (e) => {
    setValues(e.target.value);
  };

  const renderVisualization = () => {
    const props = { weights, values, capacity };
    switch (activeTab) {
      case 1:
        return <BruteForceViz {...props} />;
      case 2:
        return <RecursiveViz {...props} />;
      case 3:
        return <DPTable {...props} />;
      case 4:
        return <GreedyViz {...props} />;
      case 5:
        return <BranchAndBoundViz {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Knapsack Problem</h1>
      </header>

      <nav className="tabs-nav">
        {TAB_CONTENT.map((tab) => (
          <TabNav
            key={tab.id}
            $isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </TabNav>
        ))}
      </nav>

      <main className="tab-content">
        <InputPanel
          capacity={capacity}
          weights={weights}
          values={values}
          handleCapacityChange={handleCapacityChange}
          handleWeightsChange={handleWeightsChange}
          handleValuesChange={handleValuesChange}
        />

        <div className="visualization-panel">{renderVisualization()}</div>
      </main>
    </div>
  );
}
