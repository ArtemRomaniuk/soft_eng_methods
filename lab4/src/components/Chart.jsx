import { useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { getLagrangeFunc } from "../utils/lagrange";
import { getLSFunc } from "../utils/ls";

const ChartContainer = styled.div`
  width: 100%;
  height: 500px;
  background: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

const StyledSvg = styled.svg`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

export default function Chart({
  points,
  showLagrange,
  showLS,
  lsDegree = 2,
  animate = false,
}) {
  const svgRef = useRef();
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };

  const { lagrangeData, lsData, xDomain, yDomain } = useMemo(() => {
    if (!points || points.length === 0)
      return {
        lagrangeData: [],
        lsData: [],
        xDomain: [0, 10],
        yDomain: [0, 10],
      };

    const xMin = d3.min(points, (d) => d.x);
    const xMax = d3.max(points, (d) => d.x);
    const xRange = xMax - xMin;
    const paddingX = xRange * 0.1 || 1;

    const samples = 200;
    const lFunc = getLagrangeFunc(points);
    const sFunc = getLSFunc(points, lsDegree);

    const lData = [];
    const sData = [];

    const step = (xMax - xMin) / (samples - 1);
    for (let i = 0; i < samples; i++) {
      const x = xMin + i * step;
      lData.push({ x, y: lFunc(x) });
      sData.push({ x, y: sFunc(x) });
    }

    const allY = [...points.map((p) => p.y)];
    if (showLagrange) allY.push(...lData.map((d) => d.y));
    if (showLS) allY.push(...sData.map((d) => d.y));

    const yMin = d3.min(allY);
    const yMax = d3.max(allY);
    const yRange = yMax - yMin;
    const paddingY = yRange * 0.1 || 1;

    return {
      lagrangeData: lData,
      lsData: sData,
      xDomain: [xMin - paddingX, xMax + paddingX],
      yDomain: [yMin - paddingY, yMax + paddingY],
    };
  }, [points, showLagrange, showLS, lsDegree]);

  useEffect(() => {
    if (!svgRef.current || !points) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain(xDomain).range([0, width]);
    const y = d3.scaleLinear().domain(yDomain).range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(10).tickSize(-height).tickPadding(10))
      .attr("color", "#444")
      .selectAll("text")
      .attr("color", "#888");

    g.append("g")
      .call(d3.axisLeft(y).ticks(10).tickSize(-width).tickPadding(10))
      .attr("color", "#444")
      .selectAll("text")
      .attr("color", "#888");

    const line = d3
      .line()
      .x((d) => x(d.x))
      .y((d) => y(d.y))
      .curve(d3.curveMonotoneX);

    const duration = 2000;

    if (showLagrange) {
      const lPath = g
        .append("path")
        .datum(lagrangeData)
        .attr("fill", "none")
        .attr("stroke", "#ff4757")
        .attr("stroke-width", 2)
        .attr("d", line);

      if (animate) {
        const totalLength = lPath.node().getTotalLength();
        lPath
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(duration)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
      }
    }

    if (showLS) {
      const sPath = g
        .append("path")
        .datum(lsData)
        .attr("fill", "none")
        .attr("stroke", "#2ed573")
        .attr("stroke-width", 2)
        .attr("d", line);

      if (animate) {
        const totalLength = sPath.node().getTotalLength();
        sPath
          .attr("stroke-dasharray", totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(duration)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0)
          .on("end", () => {
            sPath.attr("stroke-dasharray", "5,5");
          });
      } else {
        sPath.attr("stroke-dasharray", "5,5");
      }
    }

    const dots = g.selectAll(".dot").data(points);
    dots
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 0)
      .attr("fill", "#1e90ff")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .transition()
      .delay((d, i) => (animate ? i * (duration / points.length) : 0))
      .duration(500)
      .attr("r", 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    points,
    lagrangeData,
    lsData,
    xDomain,
    yDomain,
    showLagrange,
    showLS,
    animate,
  ]);

  return (
    <ChartContainer>
      <StyledSvg ref={svgRef} />
    </ChartContainer>
  );
}
