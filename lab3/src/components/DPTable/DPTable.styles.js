import styled from "styled-components";

export const TableWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  background: var(--bg-glass);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-glass);
`;

export const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
  gap: 16px;
`;

export const ResultsInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ResultItem = styled.span`
  font-size: 13px;
  color: var(--text-secondary);

  strong {
    color: var(--text-primary);
    font-weight: 600;
  }

  &.max-value {
    font-size: 14px;
  }
`;

export const ReplayButton = styled.button`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--border-accent);
    border-color: var(--text-primary);
  }
`;

export const ScrollArea = styled.div`
  flex: 1;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-accent);
    border-radius: 4px;
  }
`;

export const SVGContainer = styled.svg`
  font-family: inherit;

  .cell {
    stroke: var(--border-light);
    stroke-width: 1px;
    fill: transparent;
    opacity: 0;
  }

  .cell-header {
    fill: var(--bg-tertiary);
    stroke: var(--border-light);
  }

  .cell-highlight {
    fill: rgba(0, 255, 128, 0.15);
    stroke: #00ff80;
    stroke-width: 2px;
  }

  .text-value {
    fill: var(--text-primary);
    font-size: 12px;
    font-weight: 500;
    text-anchor: middle;
    dominant-baseline: middle;
    opacity: 0;
  }

  .text-header {
    fill: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .text-label {
    fill: var(--text-tertiary);
    font-size: 10px;
    font-weight: 400;
  }
`;
