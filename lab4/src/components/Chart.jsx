import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MathEngine } from '../math_engine';

export default function Chart({ points, mode, lsmDegree, lsmCoefficients, isAnimating }) {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [legendItems, setLegendItems] = useState([]);

    useEffect(() => {
        if (!containerRef.current) return;
        const margin = { top: 40, right: 40, bottom: 50, left: 60 };
        const width = containerRef.current.clientWidth - margin.left - margin.right;
        const height = containerRef.current.clientHeight - margin.top - margin.bottom;
        d3.select(containerRef.current).select("svg").remove();
        const svg = d3.select(containerRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        g.append("g").attr("class", "grid");
        g.append("g").attr("class", "residuals-group");
        g.append("g").attr("class", "paths-group");
        g.append("g").attr("class", "points-group");
        g.append("g").attr("class", "x-axis");
        g.append("g").attr("class", "y-axis");
        svg.append("text").attr("class", "axis-label").attr("text-anchor", "middle").attr("x", (width + margin.left + margin.right) / 2).attr("y", height + margin.top + margin.bottom - 10).text("X");
        svg.append("text").attr("class", "axis-label").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("x", -(height + margin.top + margin.bottom) / 2).attr("y", 15).text("Y");
        svgRef.current = { svg, g, width, height };
        let tooltip = d3.select("body").select(".tooltip");
        if (tooltip.empty()) tooltip = d3.select("body").append("div").attr("class", "tooltip");
        svgRef.current.tooltip = tooltip;
        return () => {
            d3.select(containerRef.current).select("svg").remove();
            d3.select("body").select(".tooltip").remove();
        };
    }, []);

    useEffect(() => {
        if (!svgRef.current || points.length === 0) {
            if (svgRef.current) {
                 svgRef.current.g.select(".paths-group").selectAll("path").remove();
                 svgRef.current.g.select(".residuals-group").selectAll("line").remove();
                 svgRef.current.g.select(".points-group").selectAll(".point").remove();
            }
            setLegendItems([]);
            return;
        }
        const { g, width, height, tooltip } = svgRef.current;
        const xExtent = d3.extent(points, d => d.x);
        const yExtent = d3.extent(points, d => d.y);
        const xRange = xExtent[1] - xExtent[0] || 1;
        const yRange = yExtent[1] - yExtent[0] || 1;
        const xScale = d3.scaleLinear().domain([xExtent[0] - xRange * 0.1, xExtent[1] + xRange * 0.1]).range([0, width]);
        const yScale = d3.scaleLinear().domain([yExtent[0] - yRange * 0.1, yExtent[1] + yRange * 0.1]).range([height, 0]);
        const xAxis = d3.axisBottom(xScale).ticks(10).tickSize(-height);
        const yAxis = d3.axisLeft(yScale).ticks(10).tickSize(-width);
        g.select(".x-axis").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale));
        g.select(".y-axis").call(d3.axisLeft(yScale));
        g.select(".grid").call(xAxis).selectAll("text").remove();
        g.select(".grid").call(yAxis).selectAll("text").remove();
        g.selectAll(".grid line").attr("stroke", "#f1f5f9");
        g.select(".paths-group").selectAll("path").remove();
        g.select(".residuals-group").selectAll("line").remove();
        const dots = g.select(".points-group").selectAll(".point").data(points, d => d.x + "-" + d.y);
        dots.enter().append("circle").attr("class", "point").merge(dots).attr("cx", d => xScale(d.x)).attr("cy", d => yScale(d.y)).attr("r", 5)
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`x: ${d.x.toFixed(2)}<br/>y: ${d.y.toFixed(2)}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
            }).on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));
        dots.exit().remove();

        const renderCurve = (name, methodFunc, colorClass, animated = false) => {
            if (points.length < 2) return;
            const curvePoints = [];
            const xDomain = xScale.domain();
            const step = (xDomain[1] - xDomain[0]) / 200;
            for (let x = xDomain[0]; x <= xDomain[1]; x += step) curvePoints.push({ x: x, y: methodFunc(x) });
            
            const line = d3.line()
                .x(d => xScale(d.x))
                .y(d => yScale(d.y))
                .curve(d3.curveMonotoneX);

            const path = g.select(".paths-group").append("path")
                .datum(curvePoints)
                .attr("class", `${colorClass} ${name}-path`)
                .attr("d", line);

            if (animated) {
                const totalLength = path.node().getTotalLength();
                path.attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                    .duration(name === 'interp' ? 800 : 2000)
                    .ease(d3.easeLinear)
                    .attr("stroke-dashoffset", 0);
            }
        };

        const newLegendItems = [];
        if (mode === 'interpolation' || mode === 'all') {
            if (points.length >= 2) renderCurve('interp', (x) => MathEngine.newton(points, x), 'interp-path', isAnimating);
            newLegendItems.push({ name: 'Інтерполяція (Ньютон)', color: 'var(--interp-color)' });
        }
        if (mode === 'lsm' || mode === 'all') {
            if (points.length >= 2 && lsmCoefficients.length > 0) {
                const lsmFunc = (x) => MathEngine.evaluateLSM(lsmCoefficients, x);
                renderCurve('lsm', lsmFunc, 'lsm-path', isAnimating);
                const residuals = g.select(".residuals-group").selectAll(".residual-line").data(points);
                const lines = residuals.enter().append("line").attr("class", "residual-line").merge(residuals).attr("x1", d => xScale(d.x)).attr("y1", d => yScale(d.y)).attr("x2", d => xScale(d.x)).attr("y2", d => yScale(lsmFunc(d.x)));
                if (isAnimating) lines.attr("opacity", 0).transition().delay((d, i) => i * 100).duration(500).attr("opacity", 1);
                else lines.attr("opacity", 1);
                residuals.exit().remove();
            }
            newLegendItems.push({ name: `МНК (ступінь ${lsmDegree})`, color: 'var(--lsm-color)' });
        }
        setLegendItems(newLegendItems);
    }, [points, mode, lsmDegree, lsmCoefficients, isAnimating]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div ref={containerRef} id="chart" style={{ width: '100%', height: '500px', position: 'relative' }}></div>
            <div id="legend">
                {legendItems.map((item, idx) => (
                    <div key={idx} className="legend-item"><div className="legend-color" style={{ backgroundColor: item.color }}></div><span>{item.name}</span></div>
                ))}
            </div>
        </div>
    );
}
