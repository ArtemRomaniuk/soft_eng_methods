import styled from "styled-components";

export const VizWrapper = styled.div`
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
    strong {
      color: #00ff80;
    }
  }
`;

export const ActionButton = styled.button`
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

export const ContentArea = styled.div`
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
  display: block;
  margin: 0 auto;
`;
