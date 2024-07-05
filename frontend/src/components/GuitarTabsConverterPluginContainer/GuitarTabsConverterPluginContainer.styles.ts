// src/components/GuitarTabsConverterContainer/GuitarTabsConverterContainer.styles.ts

import styled from 'styled-components';

export const GuitarTabsConverterContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
`;

export const ParametersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

export const InstrumentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const Input = styled.input`
  padding: 5px;
`;

export const Select = styled.select`
  padding: 5px;
`;

export const OutputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const FileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const PlayPauseButton = styled.button`
  background: orange;
  border: none;
  padding: 5px;
  cursor: pointer;
`;

export const DownloadButton = styled.a`
  background: orange;
  border: none;
  padding: 5px;
  text-decoration: none;
  color: black;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 5px;
`;

export const ExecuteButton = styled.button`
  background: orange;
  border: none;
  padding: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;
