import { useRef, useEffect } from "react";
import * as d3 from "d3";
import dp from "@algorithms/dp";

export default function DPTable({ weights, values, capacity }) {
  const svg = useRef(null);

  const CELL_SIZE = 40;
  const MARGIN = 20;

  const n = weights.length;
  const width = (capacity + 1) * CELL_SIZE + MARGIN * 2;
  const height = (n + 1) * CELL_SIZE + MARGIN * 2;
  [];
  useEffect(() => {
    if (!svg.current) return;

    const container = d3.select(svg.current);
    container.selectAll("*").remove();
    const g = container
      .append("g")
      .attr("transform", `translate(${MARGIN}, ${MARGIN})`);
  }, [weights, values, capacity]);

  return (
    <svg
      ref={svg}
      width={width}
      height={height}
      style={{ border: "1px solid #ccc" }}
    />
  );
}
