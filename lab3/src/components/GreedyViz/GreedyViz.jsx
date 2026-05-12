import { useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import greedy from "@algorithms/greedy";
import { 
  VizWrapper, 
  Controls, 
  ResultsInfo, 
  ResultItem, 
  ActionButton, 
  ContentArea, 
  SVGContainer 
} from "../VizShared.styles";

export default function GreedyViz({ weights, values, capacity }) {
  const svgRef = useRef(null);
  const [animationKey, setAnimationKey] = useState(0);

  const { steps, maxValue, sortedItems } = useMemo(() => {
    const parseArray = (input) => {
      if (Array.isArray(input)) return input;
      if (typeof input !== "string") return [];
      return input
        .split(",")
        .map((v) => parseInt(v.trim()))
        .filter((v) => !isNaN(v));
    };

    const w = parseArray(weights);
    const v = parseArray(values);
    const cap = typeof capacity === "string" ? parseInt(capacity) : capacity;

    if (w.length === 0 || v.length === 0 || isNaN(cap)) {
      return { steps: [], maxValue: 0, sortedItems: [] };
    }

    return greedy(w, v, cap);
  }, [weights, values, capacity]);

  useEffect(() => {
    if (!svgRef.current || steps.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const itemHeight = 40;
    const height = steps.length * itemHeight + margin.top + margin.bottom;

    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height);

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left}, ${margin.top})`);

    
    const headers = ["Item ID", "Value", "Weight", "V/W Ratio", "Status"];
    const colWidths = [80, 80, 80, 100, 150];
    let xOffset = 0;

    headers.forEach((h, i) => {
      g.append("text")
        .attr("x", xOffset + colWidths[i] / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text-secondary)")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(h);
      xOffset += colWidths[i];
    });

    
    steps.forEach((step, i) => {
      const row = g.append("g")
        .attr("transform", `translate(0, ${i * itemHeight})`)
        .style("opacity", 0);

      row.transition()
        .delay(i * 400)
        .duration(500)
        .style("opacity", 1);

      let curX = 0;
      const data = [
        `#${step.item.id + 1}`,
        step.item.value,
        step.item.weight,
        step.item.ratio.toFixed(2),
        step.added ? "Added ✅" : "Skipped ❌"
      ];

      data.forEach((d, j) => {
        row.append("text")
          .attr("x", curX + colWidths[j] / 2)
          .attr("y", itemHeight / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", j === 4 ? (step.added ? "#00ff80" : "#ff4d4d") : "var(--text-primary)")
          .style("font-size", "13px")
          .text(d);
        curX += colWidths[j];
      });

      row.append("line")
        .attr("x1", 0)
        .attr("y1", itemHeight)
        .attr("x2", curX)
        .attr("y2", itemHeight)
        .attr("stroke", "var(--border-light)")
        .attr("stroke-width", 0.5);
    });

  }, [steps, animationKey]);

  if (steps.length === 0) {
    return <VizWrapper>Please enter valid input data</VizWrapper>;
  }

  return (
    <VizWrapper>
      <Controls>
        <ResultsInfo>
          <ResultItem className="max-value">
            <strong>Greedy Result:</strong> {maxValue}
          </ResultItem>
          <ResultItem>
            Items sorted by efficiency (Value/Weight)
          </ResultItem>
        </ResultsInfo>
        <ActionButton onClick={() => setAnimationKey(k => k + 1)}>
          Replay Step-by-Step
        </ActionButton>
      </Controls>
      <ContentArea>
        <SVGContainer ref={svgRef} />
      </ContentArea>
    </VizWrapper>
  );
}
