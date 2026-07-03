// src/components/SettingsPanel/SettingsPanel.styles.ts
import styled from 'styled-components';
import { gradients, colors, shadows, radius } from '../../styles/theme';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

export const Panel = styled.div`
  position: relative;
  width: 440px;
  max-width: 92vw;
  background: #fff;
  border-radius: ${radius.lg};
  overflow: hidden;
  box-shadow: ${shadows.lg};
  padding: 0 24px 22px;
`;

export const PanelTitle = styled.h2`
  margin: 0 -24px 18px;
  padding: 16px 24px;
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  background: ${gradients.accent};
`;

export const CloseX = styled.button`
  position: absolute;
  top: 12px;
  right: 14px;
  border: none;
  background: rgba(255, 255, 255, 0.25);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: #fff;
  transition: background 0.15s ease;
  &:hover { background: rgba(255, 255, 255, 0.45); }
`;

export const Field = styled.div`
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eee;
  &:last-of-type { border-bottom: none; }
`;

export const FieldLabel = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
`;

export const Status = styled.div<{ $ok: boolean }>`
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
  padding: 3px 10px;
  border-radius: 20px;
  color: ${({ $ok }) => ($ok ? '#047857' : '#b3261e')};
  background: ${({ $ok }) => ($ok ? '#ecfdf5' : '#fef2f2')};
  border: 1px solid ${({ $ok }) => ($ok ? '#a7f3d0' : '#fecaca')};
`;

export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 9px 11px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 8px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${colors.accent};
    box-shadow: 0 0 0 3px rgba(255, 122, 24, 0.15);
  }
`;

export const Row = styled.div`
  display: flex;
  gap: 8px;
`;

export const SaveButton = styled.button`
  background: ${gradients.accent};
  color: #fff;
  border: none;
  border-radius: ${radius.pill};
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${shadows.accent};
  transition: transform 0.15s ease, filter 0.15s ease;
  &:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.04); }
  &:disabled { opacity: 0.5; cursor: default; box-shadow: none; }
`;

export const ClearButton = styled.button`
  background: #f1f5f9;
  color: ${colors.slate};
  border: 1px solid #cbd5e1;
  border-radius: ${radius.pill};
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  &:hover:not(:disabled) { background: #e2e8f0; }
  &:disabled { opacity: 0.5; cursor: default; }
`;

export const Note = styled.div`
  font-size: 11px;
  color: #777;
  margin-top: 6px;
`;
