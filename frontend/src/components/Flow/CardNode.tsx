// src/components/CardNode/CardNode.tsx

import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { CardContainer, TitleBand, StatusDot, StatusLabel, ExecuteButton, StatusContainer, LoadingIcon, CloseButton, WarningIcon, WarningWrapper, RunOverlay, RunSpinner, StepBadge, AltBar, AltBadge, ChooseButton } from './CardNode.styles';
import { executeIcon, warningIcon, loadingIcon } from '../../assets';
import { executeCard, deleteCard } from '../../services/api';

interface CardNodeProps {
  data: {
    id: string;
    title: string;
    executed: boolean;
    inconsistent: boolean;
    onExecute: (id: string) => void;
    onUpdate: (updatedCard: any) => void;
    onDelete: (id: string) => void;
    onSelectAlternative?: (id: string) => void;
    taskId: string;
    runState?: 'queued' | 'running' | 'done' | 'error';
    alternativeGroup?: string | null;
    selected?: boolean;
  };
}

const CardNode: React.FC<CardNodeProps> = ({ data }) => {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsExecuting(true);
    try {
      const updatedCard = await executeCard(data.id);
      data.onUpdate(updatedCard);
    } catch (error) {
      console.error('Error executing card:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const confirmed = window.confirm('Are you sure you want to delete this card?');
    if (confirmed) {
      try {
        await deleteCard(data.id, data.taskId);
        data.onDelete(data.id);
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  // While a single re-execution is in flight, present the card as "running" so
  // the old "Executed" status is replaced by a clear re-activating indicator.
  const runState = data.runState || (isExecuting ? 'running' : undefined);
  const isAlternative = !!data.alternativeGroup;
  const dimmed = isAlternative && data.selected === false;

  return (
    <CardContainer $inconsistent={data.inconsistent} $runState={runState} $dimmed={dimmed}>
      <TitleBand title={data.title}>{data.title}</TitleBand>
      <CloseButton onClick={handleDelete}>×</CloseButton>
      {runState && (
        <StepBadge $state={runState}>
          {runState === 'done' ? '✓' : runState === 'error' ? '!' : runState === 'running' ? '▶' : '•'}
        </StepBadge>
      )}
      {runState === 'running' && (
        <RunOverlay>
          <RunSpinner />
          {data.executed ? 'Re-running…' : 'Running…'}
        </RunOverlay>
      )}
      {data.inconsistent && (
        <WarningWrapper data-tooltip="Output non aggiornato: gli input (prompt, contesto o una card precedente) sono cambiati dopo l'ultima esecuzione. Riesegui la card per aggiornarlo.">
          <WarningIcon src={warningIcon} alt="Inconsistent" />
        </WarningWrapper>
      )}
      {isAlternative && (
        <AltBar>
          <AltBadge $selected={!!data.selected}>{data.selected ? '✓ Chosen' : 'Alternative'}</AltBadge>
          {!data.selected && (
            <ChooseButton onClick={(e) => { e.stopPropagation(); data.onSelectAlternative?.(data.id); }}>
              Choose
            </ChooseButton>
          )}
        </AltBar>
      )}
      <StatusContainer>
        <ExecuteButton onClick={handleExecute} data-tooltip="Execute Card" disabled={isExecuting}>
          {isExecuting ? <LoadingIcon src={loadingIcon} alt="Loading" /> : <img src={executeIcon} alt="Execute" />}
        </ExecuteButton>
        <StatusDot $status={data.executed ? 'executed' : 'not-executed'} />
        <StatusLabel $status={data.executed ? 'executed' : 'not-executed'}>
          {data.executed ? 'Executed' : 'Pending'}
        </StatusLabel>
      </StatusContainer>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </CardContainer>
  );
};

export default CardNode;
