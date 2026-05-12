import styled from "styled-components";

export const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--bg-glass);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  box-shadow: var(--shadow-glass);

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-accent);
    border-radius: 3px;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: -0.2px;
  }

  input,
  textarea {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    color: var(--text-primary);
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    transition: all var(--transition-fast);

    &:hover {
      border-color: var(--border-accent);
      background: rgba(255, 255, 255, 0.08);
    }

    &:focus {
      outline: none;
      border-color: var(--text-primary);
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
    }
  }

  textarea {
    resize: vertical;
    min-height: 60px;
    font-family:
      "SF Mono", "Fira Code", "JetBrains Mono", "Courier New", monospace;
    line-height: 1.4;
  }

  small {
    font-size: 11px;
    color: var(--text-tertiary);
    opacity: 0.8;
  }
`;

export const DataInfo = styled.div`
  margin-top: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 8px;

  p {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0;
    word-break: break-all;
    line-height: 1.4;
  }

  strong {
    color: var(--text-primary);
    font-weight: 600;
    margin-right: 4px;
  }
`;
