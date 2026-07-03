import styled from 'styled-components';
import { colors, shadows, radius } from '../../styles/theme';

export const TaskContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

export const TaskItem = styled.div`
  background: ${colors.surface};
  border-radius: ${radius.lg};
  padding: 18px 56px 18px 22px;
  margin: 12px 0;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  border: 1px solid ${colors.borderSoft};
  border-left: 4px solid ${colors.accent};
  box-shadow: ${shadows.md};
  position: relative;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${shadows.lg};
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: ${colors.ink};
  }

  p {
    margin: 0.4rem 0;
    font-size: 0.95rem;
    color: #64748b;
  }

  /* The "Number of Cards" line rendered as a subtle pill. */
  p:last-of-type {
    display: inline-block;
    margin-top: 8px;
    padding: 3px 10px;
    background: #fff7ec;
    color: ${colors.accentDark};
    border: 1px solid #f0d9b5;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }
`;

export const DeleteButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  transition: background 0.15s ease, transform 0.15s ease;

  svg {
    fill: ${colors.danger};
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: ${colors.danger};
    transform: scale(1.05);
  }

  &:hover svg {
    fill: #fff;
  }
`;
