// src/pages/HomePage/HomePage.styles.ts
import styled from 'styled-components';
import { gradients, colors, shadows, radius } from '../../styles/theme';
import heroImage from '../../assets/heroimages/hero_image_2.webp';

export const HomePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: linear-gradient(rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.55)), url(${heroImage});
  background-size: cover;
  background-position: center;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  padding-top: 90px;
`;

export const MainContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 28px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
  padding: 30px 24px 100px;
`;

export const SideSection = styled.div`
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(6px);
  padding: 28px;
  border-radius: ${radius.lg};
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: ${shadows.lg};
  border-top: 4px solid ${colors.accent};
`;

export const Button = styled.button`
  padding: 14px 30px;
  margin: 0 12px;
  background: ${gradients.accent};
  border: none;
  border-radius: ${radius.pill};
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  box-shadow: ${shadows.accent};
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;

  &:hover {
    filter: brightness(1.04);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 122, 24, 0.5);
  }
`;

export const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  color: #fff;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${colors.ink};
  margin: 0 0 12px;
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

export const SectionContent = styled.p`
  font-size: 1rem;
  color: #475569;
  line-height: 1.6;
  text-align: left;
  margin: 0;
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const Footer = styled.div`
  width: 100%;
  position: fixed;
  bottom: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  @media (max-width: 768px) {
    bottom: 16px;
  }
`;
