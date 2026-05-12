import { useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import recursive from "@algorithms/recursive";
import { 
  VizWrapper, 
  Controls, 
  ResultsInfo, 
  ResultItem, 
  ActionButton, 
  ContentArea, 
  SVGContainer 
} from "../VizShared.styles";

export default function RecursiveViz({ weights, values, capacity }) {
  const svgRef = useRef(null);
  const [animationKey, setAnimationKey] = useState(0);

  const { callTree, maxValue } = useMemo(() => {
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
      return { callTree: null, maxValue: 0 };
    }

    const result = recursive(w, v, cap);
    return { callTree: result.callTree, maxValue: result.maxValue };
  }, [weights, values, capacity]);

  useEffect(() => {
    if (!svgRef.current || !callTree) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const root = d3.hierarchy(callTree);
    const leafCount = root.leaves().length;
    const depth = root.height;
    
    const width = Math.max(600, leafCount * 40); 
    const height = depth * 80 + margin.top + margin.bottom;

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const treeLayout = d3.tree().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);
    treeLayout(root);

    svg.attr("width", width).attr("height", height);

    
    const links = g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", d => d.target.data.isBest ? "#00ff80" : "var(--border-light)")
      .attr("stroke-width", d => d.target.data.isBest ? 2 : 1)
      .attr("d", d3.linkVertical().x(d => d.x).y(d => d.y))
      .style("opacity", 0);

    links.transition().delay((d, i) => i * 5).duration(300).style("opacity", d => d.target.data.isBest ? 1 : 0.4);

    
    const nodes = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("opacity", 0);

    nodes.transition().delay((d, i) => i * 5).duration(300).style("opacity", 1);

    nodes.append("circle")
      .attr("r", 12)
      .attr("fill", d => d.data.isBest ? "rgba(0, 255, 128, 0.2)" : "var(--bg-tertiary)")
      .attr("stroke", d => d.data.isBest ? "#00ff80" : "var(--border-accent)")
      .attr("stroke-width", d => d.data.isBest ? 1.5 : 1);

    nodes.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text-primary)")
      .style("font-size", "8px")
      .style("font-weight", d => d.data.isBest ? "bold" : "normal")
      .text(d => d.data.type === 'leaf' ? "End" : `I:${d.data.i}`);

    nodes.append("text")
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", d => d.data.isBest ? "#00ff80" : "var(--text-secondary)")
      .style("font-size", "7px")
      .text(d => `C:${d.data.cap}`);

  }, [callTree, animationKey]);

  if (!callTree) {
    return <VizWrapper>Please enter valid input data</VizWrapper>;
  }

  return (
    <VizWrapper>
      <Controls>
        <ResultsInfo>
          <ResultItem className="max-value">
            <strong>Recursive Max Value:</strong> {maxValue}
          </ResultItem>
          <ResultItem>
            Optimal path is highlighted in <strong>green</strong>
          </ResultItem>
        </ResultsInfo>
        <ActionButton onClick={() => setAnimationKey(k => k + 1)}>
          Re-render Tree
        </ActionButton>
      </Controls>
      <ContentArea>
        <SVGContainer ref={svgRef} />
      </ContentArea>
    </VizWrapper>
  );
}
