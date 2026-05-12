import { useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import branchAndBound from "@algorithms/branchAndBound";
import {
  VizWrapper,
  Controls,
  ResultsInfo,
  ResultItem,
  ActionButton,
  ContentArea,
  SVGContainer,
} from "../VizShared.styles";

export default function BranchAndBoundViz({ weights, values, capacity }) {
  const svgRef = useRef(null);
  const [animationKey, setAnimationKey] = useState(0);

  const { treeNodes, maxValue } = useMemo(() => {
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
      return { treeNodes: [], maxValue: 0 };
    }

    return branchAndBound(w, v, cap);
  }, [weights, values, capacity]);

  useEffect(() => {
    if (!svgRef.current || treeNodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const width = 600;
    const height = 400;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const stratify = d3.stratify().id(d => d.id).parentId(d => d.parentId);
    const root = stratify(treeNodes);
    const treeLayout = d3.tree().size([width - 80, height - 100]);
    treeLayout(root);

    svg.attr("width", width).attr("height", height);

    
    const links = g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", d => d.target.data.isBest ? "#00ff80" : "var(--border-light)")
      .attr("stroke-width", d => d.target.data.isBest ? 3 : 1)
      .attr("d", d3.linkVertical().x(d => d.x).y(d => d.y))
      .style("opacity", 0);

    
    const nodes = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("opacity", 0);

    nodes.append("circle")
      .attr("r", 14)
      .attr("fill", d => d.data.isBest ? "rgba(0, 255, 128, 0.2)" : "var(--bg-tertiary)")
      .attr("stroke", d => d.data.isBest ? "#00ff80" : "var(--border-accent)")
      .attr("stroke-width", d => d.data.isBest ? 2 : 1);

    const TEXT_X = -2;
    nodes.append("text")
      .attr("x", TEXT_X).attr("dy", ".35em").attr("text-anchor", "middle").attr("fill", "var(--text-primary)").style("font-size", "8px").style("font-weight", d => d.data.isBest ? "bold" : "normal")
      .text(d => d.data.type === 'root' ? 'Root' : `${d.data.type === 'take' ? 'T' : 'S'} I:${d.data.itemInfo.id + 1}`);

    nodes.append("text")
      .attr("x", TEXT_X).attr("y", -22).attr("text-anchor", "middle").attr("fill", "var(--text-tertiary)").style("font-size", "7px")
      .text(d => d.data.itemInfo ? `w:${d.data.itemInfo.w} v:${d.data.itemInfo.v}` : "");

    nodes.append("text")
      .attr("x", TEXT_X).attr("y", 20).attr("text-anchor", "middle").style("font-size", "7px").attr("fill", d => d.data.isBest ? "#00ff80" : "var(--text-secondary)")
      .text(d => `B: ${d.data.bound.toFixed(0)}`);

    nodes.append("text")
      .attr("x", TEXT_X).attr("y", 28).attr("text-anchor", "middle").attr("fill", "var(--text-tertiary)").style("font-size", "7px")
      .text(d => `V: ${d.data.value}`);

    
    nodes.filter(d => d.data.isPruned && !d.data.isBest)
      .append("text")
      .attr("x", 12).attr("y", -12).attr("fill", "#ff4d4d").style("font-size", "10px").style("font-weight", "bold")
      .style("opacity", 0).attr("class", "pruned-mark").text("✕");

    const STEP_DELAY = 600;
    const sortedNodes = root.descendants().sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      return a.data.id - b.data.id;
    });

    sortedNodes.forEach((d, i) => {
      const delay = i * STEP_DELAY;
      const nodeOpacity = d.data.isBest ? 1 : (d.data.isPruned ? 0.4 : 1);
      const linkOpacity = d.data.isBest ? 1 : (d.data.isPruned ? 0.2 : 1);

      nodes.filter(n => n.data.id === d.data.id).transition().delay(delay).duration(400).style("opacity", nodeOpacity);
      links.filter(l => l.target.data.id === d.data.id).transition().delay(delay - 150).duration(400).style("opacity", linkOpacity);

      if (d.data.isPruned && !d.data.isBest) {
        nodes.filter(n => n.data.id === d.data.id).select(".pruned-mark").transition().delay(delay + 200).duration(300).style("opacity", 1);
      }
    });

  }, [treeNodes, animationKey]);

  if (treeNodes.length === 0) return <VizWrapper>Please enter valid input data</VizWrapper>;

  return (
    <VizWrapper>
      <Controls>
        <ResultsInfo>
          <ResultItem className="max-value"><strong>B&B Result:</strong> {maxValue}</ResultItem>
          <ResultItem>Best-First Search (Priority Queue) order</ResultItem>
        </ResultsInfo>
        <ActionButton onClick={() => setAnimationKey(k => k + 1)}>Replay Animation</ActionButton>
      </Controls>
      <ContentArea><SVGContainer ref={svgRef} /></ContentArea>
    </VizWrapper>
  );
}
