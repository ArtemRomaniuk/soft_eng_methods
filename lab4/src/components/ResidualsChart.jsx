import { useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { getLagrangeFunc } from "../utils/lagrange";
import { getLSFunc } from "../utils/ls";

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  background: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h4`
  margin: 0 0 10px 0;
  color: #aaa;
  font-size: 12px;
  text-transform: uppercase;
`;

const StyledSvg = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

export default function ResidualsChart({
  points,
  showLagrange,
  showLS,
  lsDegree,
  animate = false,
}) {
  const svgRef = useRef();
  const margin = { top: 10, right: 30, bottom: 30, left: 50 };

  const residuals = useMemo(() => {
    if (!points || points.length === 0) return [];
    const lFunc = getLagrangeFunc(points);
    const sFunc = getLSFunc(points, lsDegree);
    return points.map((p) => ({
      id: p.x + "-" + p.y,
      x: p.x,
      lRes: p.y - lFunc(p.x),
      sRes: p.y - sFunc(p.x),
    }));
  }, [points, lsDegree]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(points, (d) => d.x))
      .range([0, width]);
    const allRes = [];
    if (showLagrange) allRes.push(...residuals.map((r) => r.lRes));
    if (showLS) allRes.push(...residuals.map((r) => r.sRes));
    const maxRes = d3.max(allRes.map(Math.abs)) || 1;
    const y = d3
      .scaleLinear()
      .domain([-maxRes * 1.2, maxRes * 1.2])
      .range([height, 0]);

    const duration = 2000;

    g.append("line")
      .attr("x1", 0)
      .attr("y1", y(0))
      .attr("x2", width)
      .attr("y2", y(0))
      .attr("stroke", "#444")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr("color", "#444");
    g.append("g").call(d3.axisLeft(y).ticks(5)).attr("color", "#444");

    if (showLagrange) {
      const lDots = g.selectAll(".l-dot").data(residuals);
      lDots
        .enter()
        .append("circle")
        .attr("class", "l-dot")
        .attr("cx", (d) => x(d.x))
        .attr("cy", y(0))
        .attr("r", 0)
        .attr("fill", "#ff4757")
        .transition()
        .delay((d, i) => (animate ? i * (duration / points.length) : 0))
        .duration(500)
        .attr("cy", (d) => y(d.lRes))
        .attr("r", 4)
        .attr("opacity", 0.6);
    }

    if (showLS) {
      const sBars = g.selectAll(".s-bar").data(residuals);
      sBars
        .enter()
        .append("rect")
        .attr("class", "s-bar")
        .attr("x", (d) => x(d.x) - 3)
        .attr("y", y(0))
        .attr("width", 6)
        .attr("height", 0)
        .attr("fill", "#2ed573")
        .transition()
        .delay((d, i) => (animate ? i * (duration / points.length) : 0))
        .duration(500)
        .attr("y", (d) => (d.sRes > 0 ? y(d.sRes) : y(0)))
        .attr("height", (d) => Math.abs(y(d.sRes) - y(0)))
        .attr("opacity", 0.6);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residuals, showLagrange, showLS, points, animate]);

  return (
    <ChartContainer>
      <Title>Residuals (Errors)</Title>
      <StyledSvg ref={svgRef} />
    </ChartContainer>
  );
}
