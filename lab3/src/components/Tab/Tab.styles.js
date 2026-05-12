import styled from "styled-components";

const TabButton = styled.button`
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: transparent;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  position: relative;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",
    "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue";
  letter-spacing: -0.3px;

  &:hover {
    color: var(--text-primary);
    background: var(--bg-glass-hover);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  ${(props) =>
    props.$isActive &&
    `
    color: var(--text-primary);
    border-bottom-color: var(--text-primary);
    background: var(--bg-glass-hover);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  `}

  &:active {
    transform: scale(0.97);
  }
`;

export default TabButton;
