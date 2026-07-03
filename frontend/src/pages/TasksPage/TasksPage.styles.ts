// src/pages/TasksPage/TasksPage.styles.ts
import styled from 'styled-components';
import { gradients, colors, shadows, radius } from '../../styles/theme';

export const TasksPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f1f5f9;
  min-height: 100vh;
  padding-top: 77px;
  box-sizing: border-box;
  position: relative;
`;

export const Title = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${colors.ink};
  margin: 0;
  position: fixed;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  background: #f1f5f9;
  z-index: 900;
  padding: 14px 0 10px;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
`;

export const TaskList = styled.div`
  width: 100%;
  max-width: 820px;
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  box-sizing: border-box;
  margin-top: 56px;
  margin-bottom: 20px;
  max-height: calc(100vh - 150px);

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
`;

export const TaskItem = styled.div`
  background: ${colors.surface};
  border-radius: ${radius.lg};
  padding: 18px 20px 18px 22px;
  margin: 14px 0;
  box-shadow: ${shadows.md};
  border: 1px solid ${colors.borderSoft};
  border-left: 4px solid ${colors.accent};
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

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

  .highlight {
    color: ${colors.accent};
  }
`;

export const ButtonsBox = styled.div`
  position: fixed;
  top: 77px;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: ${gradients.header};
  border-bottom: 3px solid ${colors.accent};
  border-bottom-left-radius: 22px;
  padding: 14px;
  box-shadow: ${shadows.md};
  box-sizing: border-box;
  z-index: 1000;
`;

const roundButton = `
  border: none;
  border-radius: 50%;
  width: 54px;
  height: 54px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 122, 24, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  .icon { fill: #fff; width: 22px; height: 22px; }
`;

export const RoundButton = styled.button`
  ${roundButton}
  background: ${gradients.accent};

  &:hover {
    transform: translateY(-1px) scale(1.03);
    box-shadow: 0 6px 16px rgba(255, 122, 24, 0.5);
  }
`;

export const ToggleButton = styled.button`
  ${roundButton}
  background: ${gradients.accent};

  &:disabled {
    background: #94a3b8;
    box-shadow: none;
    cursor: not-allowed;
  }

  &:hover:enabled {
    transform: translateY(-1px) scale(1.03);
    box-shadow: 0 6px 16px rgba(255, 122, 24, 0.5);
  }
`;

export const Section = styled.div`
  background: ${colors.surface};
  border-radius: ${radius.lg};
  padding: 20px 22px;
  margin: 14px 0;
  box-shadow: ${shadows.md};
  border: 1px solid ${colors.borderSoft};
  width: 100%;
  box-sizing: border-box;

  ul { padding-left: 20px; }
  li { margin-bottom: 4px; color: #475569; }
  h4 { margin: 14px 0 6px; color: ${colors.ink}; }
`;

export const SectionTitle = styled.h2`
  margin: 0 0 10px 0;
  font-size: 1.25rem;
  color: ${colors.ink};
`;

export const SectionContent = styled.div`
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
`;

export const Footer = styled.div`
  width: 100%;
  position: fixed;
  bottom: 20px;
  display: flex;
  justify-content: center;
  z-index: 900;
`;

export const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
`;
