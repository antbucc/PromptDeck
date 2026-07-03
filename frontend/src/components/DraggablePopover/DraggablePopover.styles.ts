// src/components/DraggablePopover/DraggablePopover.styles.ts

import styled, { keyframes } from 'styled-components';
import { gradients, colors, shadows, radius } from '../../styles/theme';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;

  &:hover {
    color: #ff0000;
  }
`;

export const PopoverContainer = styled.div`
  position: absolute;
  width: 32%;
  min-width: 380px;
  height: 82vh;
  padding: 60px 22px 0 22px;
  background: white;
  border: 1px solid ${colors.borderSoft};
  border-radius: ${radius.lg};
  z-index: 10;
  overflow: hidden;
  box-shadow: ${shadows.lg};
  display: flex;
  flex-direction: column;
`;

export const PopoverContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 12px 4px 2px;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  /* Modern form controls for the edit mode. */
  input,
  textarea,
  select {
    width: 100%;
    box-sizing: border-box;
    padding: 9px 11px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    color: ${colors.ink};
    background: #fff;
    margin-top: 2px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  textarea {
    min-height: 120px;
    resize: vertical;
    line-height: 1.5;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: ${colors.accent};
    box-shadow: 0 0 0 3px rgba(255, 122, 24, 0.15);
  }
`;

export const ButtonContainer = styled.div`
  border-top: 1px solid ${colors.borderSoft};
  width: calc(100% + 40px); /* Adjust width to compensate for the padding of PopoverContainer */
  margin-left: -20px; /* Offset margin to align with PopoverContainer */
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
  background: white;
  height: 50px; /* Adjust the height to not much bigger than the buttons */
  flex-shrink: 0; /* Ensure the button container does not shrink */
`;

export const Section = styled.div`
  margin-bottom: 14px;
  position: relative;
`;

export const SectionTitle = styled.div`
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.slate};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
  transition: color 0.15s ease;

  &:hover {
    color: ${colors.accent};
  }
`;

interface SectionContentProps {
  isCollapsed: boolean;
}

export const SectionContent = styled.div<SectionContentProps>`
  margin-top: 8px;
  max-height: ${(props) => (props.isCollapsed ? '0' : 'auto')};
  overflow-y: hidden;
  transition: max-height 0.3s ease-in-out;
`;

export const Label = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: ${colors.muted};
  margin-bottom: 4px;
`;

export const Value = styled.span`
  display: block;
  font-size: 14px;
  color: ${colors.ink};
  line-height: 1.55;
  word-break: break-word;

  p { margin: 0 0 8px; }
  p:last-child { margin-bottom: 0; }
  ul, ol { margin: 0 0 8px; padding-left: 20px; }
  code { background: #f1f5f9; padding: 1px 5px; border-radius: 4px; font-size: 0.9em; }
  pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; }
`;

export const ModelBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: #fff7ec;
  color: ${colors.accentDark};
  border: 1px solid #f0d9b5;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
`;

export const GeneratedText = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  color: ${colors.ink};
  line-height: 1.55;

  p { margin: 0 0 8px; }
  p:last-child { margin-bottom: 0; }
  ul, ol { margin: 0 0 8px; padding-left: 20px; }
`;

export const MetricsHeading = styled.h3`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.slate};
  margin: 0 0 10px;
`;

export const MetricsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const MetricRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const MetricName = styled.span`
  flex: 0 0 96px;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.slate};
`;

export const MetricBarTrack = styled.div`
  flex: 1;
  height: 8px;
  background: #eef2f7;
  border-radius: 6px;
  overflow: hidden;
`;

export const MetricBarFill = styled.div<{ $pct: number; $score: number }>`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  background: ${({ $score }) => ($score >= 4 ? '#10b981' : $score >= 3 ? '#f59e0b' : '#ef4444')};
  transition: width 0.3s ease;
`;

export const MetricScore = styled.span`
  flex: 0 0 34px;
  text-align: right;
  font-size: 13px;
  font-weight: 700;
  color: ${colors.ink};
`;

interface ExecuteButtonProps {
  disabled?: boolean;
}

export const ExecuteButton = styled.button<ExecuteButtonProps>`
  padding: 9px 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #fff;
  background: ${gradients.success};
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
  position: relative;
  pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  margin-bottom: 5px;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.45);
  }

  img {
    filter: brightness(0) invert(1);
    width: 20px;
    height: 20px;
  }

  &::after {
    content: attr(data-tooltip); /* Use data-tooltip attribute for tooltip content */
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #0f172a;
    color: white;
    padding: 5px 8px;
    border-radius: 6px;
    font-size: 12px;
    display: none;
    white-space: nowrap;
  }

  &:hover::after {
    display: block;
  }
`;

interface EvaluateButtonProps {
  disabled?: boolean;
}

export const EvaluateButton = styled.button<EvaluateButtonProps>`
  padding: 9px 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #fff;
  background: ${gradients.accent};
  box-shadow: 0 2px 8px rgba(255, 122, 24, 0.3);
  position: relative;
  pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  margin-bottom: 5px;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.05);
    box-shadow: 0 4px 12px rgba(255, 122, 24, 0.4);
  }

  img {
    filter: brightness(0) invert(1);
    width: 20px;
    height: 20px;
  }

  &::after {
    content: attr(data-tooltip); /* Use data-tooltip attribute for tooltip content */
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #0f172a;
    color: white;
    padding: 5px 8px;
    border-radius: 6px;
    font-size: 12px;
    display: none;
    white-space: nowrap;
  }

  &:hover::after {
    display: block;
  }
`;

export const LoadingIcon = styled.img`
  animation: ${spin} 2s linear infinite;
`;

export const EditButton = styled.button`
  position: absolute;
  top: 60px;
  right: 20px;
  background: ${gradients.accent};
  padding: 6px 11px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(255, 122, 24, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  z-index: 3; 

  img {
    width: 15px;
    height: 15px;
    margin-right: 3px;
    filter: brightness(0); 
  }

  &:hover {
    background: #ff8c00; 
  }
`;

export const ResolveButton = styled.button`
  position: absolute;
  top: 60px;
  right: 70px;
  background: ${gradients.accent};
  padding: 6px 11px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(255, 122, 24, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  z-index: 3; 

  img {
    width: 15px;
    height: 15px;
    margin-right: 3px;
    filter: brightness(0) invert(1);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 122, 24, 0.4);
  }
`;

export const TitleBand = styled.div`
  background: ${gradients.accent};
  color: #fff;
  width: 100%;
  height: 44px;
  padding: 8px 0;
  position: absolute;
  top: 0;
  left: 0;
  border-top-left-radius: ${radius.lg};
  border-top-right-radius: ${radius.lg};
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.2px;
  line-height: 44px;
  cursor: grab;
  box-shadow: 0 1px 0 rgba(2, 6, 23, 0.06);
`;

export const CopyButton = styled.button`
  background: ${gradients.accent};
  padding: 6px 11px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(255, 122, 24, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  margin-left: 10px; /* Add some space between the buttons */
  position: relative;
  top: -5px; /* Move up by 5px */
  right: -7px; /* Move right by 5px */

  img {
    width: 15px;
    height: 15px;
    margin-right: 3px;
    filter: brightness(0) invert(1);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 122, 24, 0.4);
  }
`;

export const ModalButton = styled.button`
  background: ${gradients.accent};
  padding: 6px 11px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(255, 122, 24, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  margin-left: 10px; /* Add some space between the buttons */
  position: relative;
  top: -5px; /* Move up by 5px */
  right: -5px; /* Move right by 5px */

  img {
    width: 15px;
    height: 15px;
    margin-right: 3px;
    filter: brightness(0) invert(1);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 122, 24, 0.4);
  }
`;

export const OutputSection = styled.div`
  align-items: center;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 10px;
  position: relative;
`;

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 2; /* Ensure buttons are above the output section */
  top: -3px; /* Move up by 3px */
  right: -5px; /* Move right by 5px */
`;

export const AddPluginButton = styled.button`
  background: ${gradients.accent};
  padding: 6px 11px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(255, 122, 24, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  position: absolute;
  right: -10px;
  top: -7px; /* Move up by 5px */

  img {
    width: 15px;
    height: 15px;
    margin-right: 3px;
    filter: brightness(0) invert(1);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 122, 24, 0.4);
  }
`;

export const PluginsContainer = styled.div`
  width: 100%;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
