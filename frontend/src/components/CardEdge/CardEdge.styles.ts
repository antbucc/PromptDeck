// src/components/CardEdge/CardEdge.styles.ts

import styled, { keyframes, css } from 'styled-components';

const dashAnimation = keyframes`
  to {
    stroke-dashoffset: 0;
  }
`;

export const EdgeButton = styled.img`
  cursor: pointer;
  border: 2px solid black;
  border-radius: 50%;
  background-color: red;
`;

// Edge appearance reflects the flow execution:
//  - done    : both endpoints executed → solid green
//  - active  : currently being traversed → animated blue
//  - pending : still to be executed → static grey dashed
export const EdgePath = styled.path<{ $status?: string }>`
  fill: none;
  stroke: ${({ $status }) =>
    $status === 'done' ? '#10b981' : $status === 'active' ? '#3b82f6' : '#cbd5e1'};
  stroke-width: ${({ $status }) => ($status === 'active' ? 3 : 2.5)};
  stroke-dasharray: ${({ $status }) => ($status === 'done' ? 'none' : '8')};
  stroke-dashoffset: 16;
  animation: ${({ $status }) =>
    $status === 'active' ? css`${dashAnimation} 0.7s linear infinite` : 'none'};
`;

export const PopoverContainer = styled.div`
  position: absolute;
  background: white;
  border: 2px solid black;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 1000;
`;
