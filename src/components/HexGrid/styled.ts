import styled from "styled-components";

export const Canvas = styled.canvas<{ $isDragging: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "grab")};
  background: #000;
`;
