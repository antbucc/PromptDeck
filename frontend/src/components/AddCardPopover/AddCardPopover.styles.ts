import styled from 'styled-components';
import { gradients, colors, shadows, radius } from '../../styles/theme';

export const FormContainer = styled.div`
  position: absolute;
  width: 30%;
  height: 80%; /* Set height to 80% of the page */
  padding: 60px 20px 20px 20px; /* Add padding at the top to account for the title bar */
  background: #fff;
  box-sizing: border-box;
  overflow-y: auto;
  z-index: 1001; /* Higher z-index to ensure it's on top of the flow */
  border: 1px solid ${colors.borderSoft};
  border-radius: ${radius.lg};
  box-shadow: ${shadows.lg};

  /* Hide scrollbar for Webkit browsers */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for other browsers */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
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

export const FormTextArea = styled.textarea`
  width: 100%;
  height: 150px; /* Increased height */
  padding: 8px;
  margin-bottom: 10px;
  box-sizing: border-box;
  resize: none; /* Make text areas non-resizable */
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

export const DropdownSelect = styled.select`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  box-sizing: border-box;
  height: auto;
`;

export const DropdownButton = styled.button`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  box-sizing: border-box;
  cursor: pointer;
  background-color: #61dafb;
  border: none;
  border-radius: 5px;
  color: #fff;

  &:hover {
    background-color: #21a1f1;
  }
`;

export const DropdownContainer = styled.div`
  position: relative;
`;

interface DropdownMenuProps {
  show: boolean;
}

export const DropdownMenu = styled.div<DropdownMenuProps>`
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ccc;
  z-index: 1002; /* Ensure dropdown is above other elements */
  display: ${props => (props.show ? 'block' : 'none')};
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
