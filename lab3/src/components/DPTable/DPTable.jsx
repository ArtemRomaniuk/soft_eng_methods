import { useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import dp from "@algorithms/dp";
import {
  TableWrapper,
  SVGContainer,
  Controls,
  ReplayButton,
  ScrollArea,
  ResultsInfo,
  ResultItem,
} from "./DPTable.styles";

export default function DPTable({ weights, values, capacity }) {
  const svgRef = useRef(null);
  const [animationKey, setAnimationKey] = useState(0);

  const CELL_SIZE = 50;
  const HEADER_WIDTH = 120;
  const HEADER_HEIGHT = 60;
  const MARGIN = 40;

  const {
    dpTable,
    path,
    n,
    parsedCapacity,
    parsedWeights,
    parsedValues,
    maxValue,
  } = useMemo(() => {
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

    if (w.length === 0 || v.length === 0 || isNaN(cap) || cap < 0) {
      return {
        dpTable: [],
        path: [],
        n: 0,
        parsedCapacity: 0,
        parsedWeights: [],
        parsedValues: [],
        maxValue: 0,
        selectedItems: [],
      };
    }

    const minLen = Math.min(w.length, v.length);
    const finalW = w.slice(0, minLen);
    const finalV = v.slice(0, minLen);

    const { dp: table, maxValue, selectedItems } = dp(finalW, finalV, cap);
    const n = finalW.length;

    // Reconstruct path and identify selected items
    const path = [];
    let currW = cap;
    for (let i = n; i > 0; i--) {
      const selected = table[i][currW] !== table[i - 1][currW];
      path.push({ i, w: currW, selected });
      if (selected) {
        currW -= finalW[i - 1];
      }
    }
    path.push({ i: 0, w: currW, selected: false });

    return {
      dpTable: table,
      path,
      n,
      parsedCapacity: cap,
      parsedWeights: finalW,
      parsedValues: finalV,
      maxValue,
      selectedItems,
    };
  }, [weights, values, capacity]);

  useEffect(() => {
    if (!svgRef.current || dpTable.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = HEADER_WIDTH + (parsedCapacity + 1) * CELL_SIZE + MARGIN * 2;
    const height = HEADER_HEIGHT + (n + 1) * CELL_SIZE + MARGIN * 2;

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN}, ${MARGIN})`);

    // Static Headers
    g.append("text")
      .attr("x", HEADER_WIDTH + ((parsedCapacity + 1) * CELL_SIZE) / 2)
      .attr("y", -15)
      .attr("class", "text-header")
      .style("font-size", "14px")
      .text("Capacity (w)");

    const columnHeaders = g.append("g").attr("class", "column-headers");
    for (let w = 0; w <= parsedCapacity; w++) {
      columnHeaders
        .append("rect")
        .attr("x", HEADER_WIDTH + w * CELL_SIZE)
        .attr("y", 0)
        .attr("width", CELL_SIZE)
        .attr("height", HEADER_HEIGHT)
        .attr("class", "cell-header");
      columnHeaders
        .append("text")
        .attr("x", HEADER_WIDTH + w * CELL_SIZE + CELL_SIZE / 2)
        .attr("y", HEADER_HEIGHT / 2)
        .attr("class", "text-header")
        .text(w);
    }

    const rowHeaders = g.append("g").attr("class", "row-headers");
    for (let i = 0; i <= n; i++) {
      rowHeaders
        .append("rect")
        .attr("x", 0)
        .attr("y", HEADER_HEIGHT + i * CELL_SIZE)
        .attr("width", HEADER_WIDTH)
        .attr("height", CELL_SIZE)
        .attr("class", "cell-header")
        .attr("id", `row-header-${i}`);

      const gLabel = rowHeaders
        .append("g")
        .attr(
          "transform",
          `translate(${HEADER_WIDTH / 2}, ${HEADER_HEIGHT + i * CELL_SIZE + CELL_SIZE / 2})`,
        );

      if (i === 0) {
        gLabel.append("text").attr("class", "text-header").text("Initial (0)");
      } else {
        gLabel
          .append("text")
          .attr("y", -6)
          .attr("class", "text-header")
          .style("font-size", "10px")
          .text(`Item ${i}`);
        gLabel
          .append("text")
          .attr("y", 8)
          .attr("class", "text-label")
          .style("text-anchor", "middle")
          .text(`w:${parsedWeights[i - 1]} v:${parsedValues[i - 1]}`);
      }
    }

    // Animated Cells
    const cellsGroup = g.append("g").attr("class", "cells");
    const CELL_ANIMATION_DURATION = 30;
    const TOTAL_CELLS = (n + 1) * (parsedCapacity + 1);

    for (let i = 0; i <= n; i++) {
      for (let w = 0; w <= parsedCapacity; w++) {
        const index = i * (parsedCapacity + 1) + w;
        const delay = index * CELL_ANIMATION_DURATION;

        const cell = cellsGroup
          .append("g")
          .attr("class", "cell-group")
          .attr("id", `cell-${i}-${w}`);

        cell
          .append("rect")
          .attr("x", HEADER_WIDTH + w * CELL_SIZE)
          .attr("y", HEADER_HEIGHT + i * CELL_SIZE)
          .attr("width", CELL_SIZE)
          .attr("height", CELL_SIZE)
          .attr("class", "cell")
          .transition()
          .delay(delay)
          .duration(200)
          .style("opacity", 1);

        cell
          .append("text")
          .attr("x", HEADER_WIDTH + w * CELL_SIZE + CELL_SIZE / 2)
          .attr("y", HEADER_HEIGHT + i * CELL_SIZE + CELL_SIZE / 2)
          .attr("class", "text-value")
          .text(dpTable[i][w])
          .transition()
          .delay(delay + 50)
          .duration(200)
          .style("opacity", 1);
      }
    }

    // Animated Highlight for Selected Items only
    const PATH_DELAY = TOTAL_CELLS * CELL_ANIMATION_DURATION + 300;
    path.forEach((p, idx) => {
      const stepDelay = PATH_DELAY + idx * 150;

      // Highlight cell ONLY if item was selected at this step
      if (p.selected) {
        d3.select(`#cell-${p.i}-${p.w} rect`)
          .transition()
          .delay(stepDelay)
          .duration(400)
          .attr("class", "cell cell-highlight");

        // Also highlight the row header for this item
        d3.select(`#row-header-${p.i}`)
          .transition()
          .delay(stepDelay)
          .duration(400)
          .style("fill", "rgba(0, 255, 128, 0.2)")
          .style("stroke", "#00ff80");
      }
    });
  }, [
    dpTable,
    path,
    n,
    parsedCapacity,
    parsedWeights,
    parsedValues,
    animationKey,
  ]);

  if (dpTable.length === 0) {
    return <TableWrapper>Please enter valid input data</TableWrapper>;
  }

  return (
    <TableWrapper>
      <Controls>
        <ResultsInfo>
          <ResultItem className="max-value">
            <strong>Max Value:</strong> {maxValue}
          </ResultItem>
        </ResultsInfo>
        <ReplayButton onClick={() => setAnimationKey((prev) => prev + 1)}>
          Replay Animation
        </ReplayButton>
      </Controls>
      <ScrollArea>
        <SVGContainer ref={svgRef} />
      </ScrollArea>
    </TableWrapper>
  );
}
