import styled, { keyframes } from 'styled-components';
import { gradients, colors, shadows, radius } from '../../styles/theme';

export const FormContainer = styled.div`
  position: absolute;
  width: 30%;
  padding: 60px 20px 20px 20px;
  background: #fff;
  box-sizing: border-box;
  overflow-y: auto;
  z-index: 1001;
  border: 1px solid ${colors.borderSoft};
  border-radius: ${radius.lg};
  box-shadow: ${shadows.lg};

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const FormLabel = styled.label`
  display: block;
  margin: 10px 0 5px;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  box-sizing: border-box;
`;

export const FormButton = styled.button`
  padding: 11px 22px;
  background: ${gradients.accent};
  border: none;
  border-radius: ${radius.pill};
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin: 0 auto;
  display: block;
  box-shadow: ${shadows.accent};
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.03);
    box-shadow: 0 6px 16px rgba(255, 122, 24, 0.45);
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

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin: 10px 0;
  cursor: pointer;
  font-size: 16px;

  input[type="checkbox"] {
    appearance: none;
    width: 24px;
    height: 24px;
    background-color: #fff;
    border: 2px solid #333;
    border-radius: 4px;
    margin-right: 10px;
    position: relative;
    cursor: pointer;
    outline: none;
    transition: background-color 0.2s, border-color 0.2s;

    &:checked {
      background-color: orange;
      border-color: #000;
    }
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  box-sizing: border-box;
  height: auto;
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

export const LoadingModal = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 14px;
  padding: 24px;
  box-sizing: border-box;
  z-index: 1002;
`;

export const LoadingText = styled.p`
  font-size: 18px;
  color: #000;
  font-weight: bold;
  margin: 0;
  text-align: center;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 4px solid #eee;
  border-top-color: orange;
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
`;

export const ProgressTrack = styled.div`
  width: 100%;
  max-width: 320px;
  height: 10px;
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 6px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => Math.min(100, Math.max(0, $percent))}%;
  background: orange;
  transition: width 0.4s ease;
`;

export const StageText = styled.div`
  font-size: 14px;
  color: #333;
  text-align: center;
  min-height: 18px;
`;

export const ElapsedText = styled.div`
  font-size: 12px;
  color: #888;
`;
