import styled, { keyframes, css } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.45); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

// Border + shadow per run state; falls back to inconsistent/low-score/default.
const runBorder = (runState?: string, inconsistent?: boolean, lowScore?: boolean) => {
  switch (runState) {
    case 'running': return '#3b82f6';
    case 'done': return '#10b981';
    case 'error': return '#ef4444';
    case 'queued': return '#cbd5e1';
    default: return inconsistent ? '#f59e0b' : lowScore ? '#f43f5e' : 'rgba(15, 23, 42, 0.08)';
  }
};

export const CardContainer = styled.div<{ $inconsistent?: boolean; $runState?: string; $dimmed?: boolean; $lowScore?: boolean }>`
  position: relative;
  width: 220px;
  min-height: 150px;
  margin: 16px;
  padding: 50px 14px 42px;
  background: ${({ $lowScore }) => ($lowScore ? '#fff5f6' : '#ffffff')};
  border-radius: 16px;
  border: 1px ${({ $dimmed }) => ($dimmed ? 'dashed' : 'solid')} ${({ $runState, $inconsistent, $lowScore }) => runBorder($runState, $inconsistent, $lowScore)};
  opacity: ${({ $runState, $dimmed }) => ($runState === 'queued' ? 0.65 : $dimmed ? 0.5 : 1)};
  box-shadow: ${({ $inconsistent, $lowScore }) =>
    $inconsistent
      ? '0 6px 18px rgba(245, 158, 11, 0.25)'
      : $lowScore
        ? '0 6px 18px rgba(244, 63, 94, 0.22)'
        : '0 4px 14px rgba(2, 6, 23, 0.08)'};
  ${({ $runState }) => $runState === 'running' && css`animation: ${pulse} 1.4s ease-out infinite;`}
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 26px rgba(2, 6, 23, 0.16);
  }
`;

export const RunOverlay = styled.div`
  position: absolute;
  inset: 40px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(239, 246, 255, 0.96);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  z-index: 3;
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
`;

export const RunSpinner = styled.div`
  width: 22px;
  height: 22px;
  border: 3px solid #dbeafe;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const StepBadge = styled.div<{ $state: string }>`
  position: absolute;
  top: 9px;
  left: 12px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: ${({ $state }) =>
    $state === 'done' ? '#10b981' : $state === 'error' ? '#ef4444' : $state === 'running' ? '#3b82f6' : '#94a3b8'};
  z-index: 4;
`;

export const TitleBand = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 11px 36px 11px 16px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #ffa63d 0%, #ff7a18 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.2px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 1px 0 rgba(2, 6, 23, 0.06);
`;

export const CardTitle = styled.h2`
  margin: 0;
  font-size: 14px;
`;

export const StatusContainer = styled.div`
  position: absolute;
  bottom: 14px;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

export const StatusDot = styled.span<{ $status: string }>`
  height: 12px;
  width: 12px;
  background-color: ${({ $status }) => ($status === 'executed' ? '#10b981' : '#f43f5e')};
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px ${({ $status }) => ($status === 'executed' ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)')};
  display: inline-block;
`;

export const StatusLabel = styled.span<{ $status: string }>`
  font-size: 12px;
  font-weight: 500;
  color: ${({ $status }) => ($status === 'executed' ? '#047857' : '#9ca3af')};
`;

export const ExecuteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
  pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};
  opacity: ${(props) => (props.disabled ? 0.55 : 1)};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
    filter: brightness(1.05);
  }

  img {
    filter: brightness(0) invert(1);
    width: 18px;
    height: 18px;
  }

  &::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #0f172a;
    color: #fff;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    display: none;
    white-space: nowrap;
  }

  &:hover::after {
    display: block;
  }
`;

export const LoadingIcon = styled.img`
  animation: ${spin} 1s linear infinite;
`;

export const LoadingMessage = styled.p`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #000;
  text-align: center;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 9px;
  right: 10px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;

  &:hover {
    background: #ef4444;
    transform: scale(1.1);
  }
`;

export const Preview = styled.div`
  font-size: 11px;
  line-height: 1.35;
  color: #64748b;
  margin-top: 2px;
  max-height: 46px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

export const ScoreBadge = styled.span<{ $score: number }>`
  font-size: 11px;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 20px;
  color: #fff;
  background: ${({ $score }) => ($score >= 4 ? '#10b981' : $score >= 3 ? '#f59e0b' : '#ef4444')};
`;

export const WarningWrapper = styled.span`
  position: absolute;
  top: 56px;
  right: 12px;
  display: inline-flex;
  cursor: help;
  z-index: 4;

  &::after {
    content: attr(data-tooltip);
    position: absolute;
    top: 130%;
    right: 0;
    width: 210px;
    background: #0f172a;
    color: #fff;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.4;
    white-space: normal;
    text-align: left;
    box-shadow: 0 6px 18px rgba(2, 6, 23, 0.3);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
    z-index: 20;
  }

  &:hover::after {
    opacity: 1;
  }
`;

export const WarningIcon = styled.img`
  display: block;
  width: 20px;
  height: 20px;
  padding: 3px;
  background: #fffbeb;
  border: 1px solid #f59e0b;
  border-radius: 6px;
`;

export const AltBar = styled.div`
  position: absolute;
  top: 50px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  z-index: 4;
`;

export const AltBadge = styled.span<{ $selected: boolean }>`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 2px 9px;
  border-radius: 20px;
  background: ${({ $selected }) => ($selected ? '#ecfdf5' : '#eef2ff')};
  color: ${({ $selected }) => ($selected ? '#047857' : '#4f46e5')};
  border: 1px solid ${({ $selected }) => ($selected ? '#a7f3d0' : '#c7d2fe')};
`;

export const ChooseButton = styled.button`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 3px 11px;
  border-radius: 20px;
  cursor: pointer;
  background: #4f46e5;
  color: #fff;
  border: none;
  transition: background 0.15s ease;

  &:hover {
    background: #4338ca;
  }
`;
