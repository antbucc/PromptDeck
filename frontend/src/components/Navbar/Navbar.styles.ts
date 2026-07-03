// src/components/Navbar/Navbar.styles.ts
import styled from 'styled-components';
import { gradients, colors, shadows } from '../../styles/theme';

export const NavbarContainer = styled.nav`
  width: 100%;
  background: ${gradients.header};
  padding: 18px 30px;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: ${shadows.md};
  border-bottom: 3px solid ${colors.accent};
  z-index: 1000;
  box-sizing: border-box;
`;

export const NavLink = styled.a`
  color: ${colors.textLight};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 8px;
  transition: background 0.2s ease, color 0.2s ease;
  display: inline-flex;
  align-items: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${colors.accentLight};
  }
`;
