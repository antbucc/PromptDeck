// src/pages/TaskDetailPage/TaskDetailPage.styles.ts
import styled from 'styled-components';
import { gradients, colors, shadows } from '../../styles/theme';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #fff; /* White background */
`;
export const TaskInfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
  position: absolute;
  top: 60px; /* Position it below the OptionsBar */
  z-index: 1; /* Ensure it is above the Flow component */
`;

export const TaskInfoBox = styled.div`
  background: ${gradients.header};
  border-bottom-right-radius: 24px;
  padding: 20px 26px;
  box-sizing: border-box;
  z-index: 1;
  border-bottom: 3px solid ${colors.accent};
  box-shadow: ${shadows.md};
`;

export const TaskInfo = styled.div`
  display: flex;
  flex-direction: column;

  h1 {
    margin: 0;
    font-size: 24px;
    color: #fff;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #fff
  }
`;

export const ButtonsBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  background: ${gradients.header};
  border-bottom-left-radius: 24px;
  border-bottom: 3px solid ${colors.accent};
  padding: 14px 16px;
  margin-top: 10px;
  width: auto;
  box-shadow: ${shadows.md};
  box-sizing: border-box;
  z-index: 2;
`;

export const RoundButton = styled.button`
  background: ${gradients.accent};
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  box-shadow: ${shadows.accent};
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px) scale(1.03);
    box-shadow: 0 6px 16px rgba(255, 122, 24, 0.5);
  }

  .icon {
    fill: #fff;
    width: 24px;
    height: 24px;
  }
`;

export const RunFlowButton = styled.button`
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: #fff;
  border: none;
  border-radius: 30px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

export const GroupButton = styled.button`
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 30px;
  padding: 9px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    background: #4338ca;
  }
`;

export const RunProgressBanner = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background: #0f172a;
  color: #fff;
  padding: 9px 18px;
  border-radius: 0 0 14px 14px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 5;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.3);
`;

export const MiniBarTrack = styled.div`
  width: 160px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

export const MiniBarFill = styled.div<{ $p: number }>`
  height: 100%;
  width: ${({ $p }) => Math.min(100, Math.max(0, $p))}%;
  background: #34d399;
  transition: width 0.3s ease;
`;

export const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 60px); /* Adjust based on the height of the OptionsBar */
  box-sizing: border-box;
  margin-top: 20px; /* Ensure it doesn't overlap with the TaskInfoContainer */
  z-index: 0; /* Ensure it is below the TaskInfoContainer and ButtonsBox */
`;
