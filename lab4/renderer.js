/**
 * D3.js Renderer for Charts
 */

class ChartRenderer {
    constructor(containerId) {
        this.containerId = containerId;
        this.margin = { top: 40, right: 40, bottom: 50, left: 60 };
        this.width = 0;
        this.height = 0;
        this.svg = null;
        this.g = null;
        this.xScale = null;
        this.yScale = null;
        this.tooltip = d3.select("body").append("div").attr("class", "tooltip");
        
        this.init();
        window.addEventListener('resize', () => this.resize());
    }

    init() {
        const container = document.getElementById(this.containerId);
        this.width = container.clientWidth - this.margin.left - this.margin.right;
        this.height = container.clientHeight - this.margin.top - this.margin.bottom;

        // Clear existing SVG
        d3.select(`#${this.containerId} svg`).remove();

        this.svg = d3.select(`#${this.containerId}`)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.g = this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Groups for layering
        this.g.append("g").attr("class", "grid");
        this.g.append("g").attr("class", "residuals-group");
        this.g.append("g").attr("class", "paths-group");
        this.g.append("g").attr("class", "points-group");
        this.g.append("g").attr("class", "x-axis");
        this.g.append("g").attr("class", "y-axis");

        // Labels
        this.svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("x", (this.width + this.margin.left + this.margin.right) / 2)
            .attr("y", this.height + this.margin.top + this.margin.bottom - 10)
            .text("X");

        this.svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -(this.height + this.margin.top + this.margin.bottom) / 2)
            .attr("y", 15)
            .text("Y");
    }

    resize() {
        this.init();
        // Redraw current state if needed - handled by app.js
    }

    updateScales(points) {
        if (points.length === 0) return;

        const xExtent = d3.extent(points, d => d.x);
        const yExtent = d3.extent(points, d => d.y);

        // Add 10% padding
        const xRange = xExtent[1] - xExtent[0] || 1;
        const yRange = yExtent[1] - yExtent[0] || 1;

        this.xScale = d3.scaleLinear()
            .domain([xExtent[0] - xRange * 0.1, xExtent[1] + xRange * 0.1])
            .range([0, this.width]);

        this.yScale = d3.scaleLinear()
            .domain([yExtent[0] - yRange * 0.1, yExtent[1] + yRange * 0.1])
            .range([this.height, 0]);

        this.renderAxes();
    }

    renderAxes() {
        const xAxis = d3.axisBottom(this.xScale).ticks(10).tickSize(-this.height);
        const yAxis = d3.axisLeft(this.yScale).ticks(10).tickSize(-this.width);

        this.g.select(".x-axis")
            .attr("transform", `translate(0,${this.height})`)
            .call(d3.axisBottom(this.xScale));

        this.g.select(".y-axis")
            .call(d3.axisLeft(this.yScale));

        this.g.select(".grid")
            .call(xAxis)
            .selectAll("text").remove();
        
        this.g.select(".grid")
            .call(yAxis)
            .selectAll("text").remove();
            
        this.g.selectAll(".grid line").attr("stroke", "#f1f5f9");
    }

    renderPoints(points) {
        const dots = this.g.select(".points-group").selectAll(".point")
            .data(points);

        dots.enter()
            .append("circle")
            .attr("class", "point")
            .merge(dots)
            .attr("cx", d => this.xScale(d.x))
            .attr("cy", d => this.yScale(d.y))
            .attr("r", 5)
            .on("mouseover", (event, d) => {
                this.tooltip.transition().duration(200).style("opacity", .9);
                this.tooltip.html(`x: ${d.x.toFixed(2)}<br/>y: ${d.y.toFixed(2)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                this.tooltip.transition().duration(500).style("opacity", 0);
            });

        dots.exit().remove();
    }

    renderCurve(name, points, methodFunc, colorClass, animated = false) {
        if (points.length < 2) return;

        // Generate points for the curve
        const curvePoints = [];
        const xMin = this.xScale.domain()[0];
        const xMax = this.xScale.domain()[1];
        const step = (xMax - xMin) / 200;

        for (let x = xMin; x <= xMax; x += step) {
            curvePoints.push({ x: x, y: methodFunc(x) });
        }

        const line = d3.line()
            .x(d => this.xScale(d.x))
            .y(d => this.yScale(d.y));

        const path = this.g.select(".paths-group").selectAll(`.${colorClass}`)
            .data([curvePoints]);

        const pathEnter = path.enter()
            .append("path")
            .attr("class", `${colorClass} ${name}-path`);

        const pathUpdate = pathEnter.merge(path)
            .attr("d", line);

        if (animated) {
            const totalLength = pathUpdate.node().getTotalLength();
            pathUpdate
                .attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);
        }

        path.exit().remove();
    }

    renderResiduals(points, evaluateFunc, animated = false) {
        const residuals = this.g.select(".residuals-group").selectAll(".residual-line")
            .data(points);

        const lines = residuals.enter()
            .append("line")
            .attr("class", "residual-line")
            .merge(residuals)
            .attr("x1", d => this.xScale(d.x))
            .attr("y1", d => this.yScale(d.y))
            .attr("x2", d => this.xScale(d.x))
            .attr("y2", d => this.yScale(evaluateFunc(d.x)));

        if (animated) {
            lines.attr("opacity", 0)
                .transition()
                .delay((d, i) => i * 100)
                .duration(500)
                .attr("opacity", 1);
        } else {
            lines.attr("opacity", 1);
        }

        residuals.exit().remove();
    }

    clearPaths() {
        this.g.select(".paths-group").selectAll("path").remove();
        this.g.select(".residuals-group").selectAll("line").remove();
    }

    updateLegend(items) {
        const legend = d3.select("#legend");
        legend.selectAll("*").remove();

        items.forEach(item => {
            const div = legend.append("div").attr("class", "legend-item");
            div.append("div")
                .attr("class", "legend-color")
                .style("background-color", item.color);
            div.append("span").text(item.name);
        });
    }
}
