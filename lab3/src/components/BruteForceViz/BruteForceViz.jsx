import { useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import bruteForce from "@algorithms/bruteForce";
import { 
  VizWrapper, 
  Controls, 
  ResultsInfo, 
  ResultItem, 
  ActionButton, 
  ContentArea, 
  SVGContainer 
} from "../VizShared.styles";

export default function BruteForceViz({ weights, values, capacity }) {
  const svgRef = useRef(null);
  const [animationKey, setAnimationKey] = useState(0);

  const { history, maxValue } = useMemo(() => {
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
      return { history: [], maxValue: 0 };
    }

    return bruteForce(w, v, cap);
  }, [weights, values, capacity]);

  useEffect(() => {
    if (!svgRef.current || history.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(history, d => d.weight) * 1.1])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(history, d => d.value) * 1.1])
      .range([height, 0]);

    
    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "var(--text-secondary)")
      .text("Total Weight");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("fill", "var(--text-secondary)")
      .text("Total Value");

    
    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));
    
    g.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""));

    
    const dots = g.selectAll(".dot")
      .data(history)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.weight))
      .attr("cy", d => yScale(d.value))
      .attr("r", 0)
      .attr("fill", d => d.isBest ? "#00ff80" : "rgba(255, 255, 255, 0.2)")
      .attr("stroke", d => d.isBest ? "#fff" : "none")
      .style("cursor", "pointer");

    dots.transition()
      .delay((d, i) => i * (2000 / history.length))
      .duration(200)
      .attr("r", d => d.isBest ? 6 : 3);

    
    dots.on("mouseover", function(event, d) {
      d3.select(this).attr("r", 8).attr("fill", "#fff");
    }).on("mouseout", function(event, d) {
      d3.select(this).attr("r", d.isBest ? 6 : 3).attr("fill", d.isBest ? "#00ff80" : "rgba(255, 255, 255, 0.2)");
    });

  }, [history, animationKey]);

  if (history.length === 0) {
    return <VizWrapper>Please enter valid input data</VizWrapper>;
  }

  return (
    <VizWrapper>
      <Controls>
        <ResultsInfo>
          <ResultItem className="max-value">
            <strong>Brute Force Max Value:</strong> {maxValue}
          </ResultItem>
          <ResultItem>
            Showing {history.length} valid combinations
          </ResultItem>
        </ResultsInfo>
        <ActionButton onClick={() => setAnimationKey(k => k + 1)}>
          Replay Plotting
        </ActionButton>
      </Controls>
      <ContentArea>
        <SVGContainer ref={svgRef} />
      </ContentArea>
    </VizWrapper>
  );
}
