import styled from "styled-components";

export const Container = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: rgba(17, 17, 17, 0.95);
  border: 1px solid #333;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  z-index: 100;
`;

export const Button = styled.button<{ $variant?: "init" | "play" | "stop" }>`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $variant }) => {
    if ($variant === "init" || $variant === "play") {
      return `
        background: #00ff88;
        color: #000;
        &:hover { background: #00dd77; }
      `;
    }
    if ($variant === "stop") {
      return `
        background: #ff4444;
        color: #fff;
        &:hover { background: #dd3333; }
      `;
    }
  }}
`;

export const BPMControl = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  color: #fff;

  label {
    font-weight: bold;
  }

  input {
    width: 70px;
    padding: 0.5rem;
    background: #222;
    border: 1px solid #444;
    border-radius: 4px;
    color: #fff;
    font-size: 1rem;
  }
`;
