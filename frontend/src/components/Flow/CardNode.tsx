// src/components/CardNode/CardNode.tsx

import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { CardContainer, TitleBand, StatusDot, StatusLabel, ExecuteButton, StatusContainer, LoadingIcon, CloseButton, WarningIcon, WarningWrapper, RunOverlay, RunSpinner, StepBadge, AltBar, AltBadge, ChooseButton, Preview, ScoreBadge } from './CardNode.styles';
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
    outputPreview?: string;
    avgScore?: number | null;
    outputFormat?: string;
  };
}

const CardNode: React.FC<CardNodeProps> = ({ data }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [imgErr, setImgErr] = useState(false);

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
  const hasScore = typeof data.avgScore === 'number';
  // Metrics below 3.5/5 flag the card as needing improvement (highlighted colour).
  const needsImprovement = hasScore && (data.avgScore as number) < 3.5;

  return (
    <CardContainer $inconsistent={data.inconsistent} $runState={runState} $dimmed={dimmed} $lowScore={needsImprovement}>
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
      {data.outputPreview && runState !== 'running' && (
        data.outputFormat === 'image' ? (
          imgErr
            ? <Preview>🖼 image (re-run to retry)</Preview>
            : <img src={data.outputPreview} alt="output" onError={() => setImgErr(true)} style={{ width: '100%', maxHeight: 56, objectFit: 'cover', borderRadius: 6, marginTop: 2 }} />
        ) : (
          <Preview title={data.outputPreview}>{data.outputPreview}</Preview>
        )
      )}
      <StatusContainer>
        <ExecuteButton onClick={handleExecute} data-tooltip="Execute Card" disabled={isExecuting}>
          {isExecuting ? <LoadingIcon src={loadingIcon} alt="Loading" /> : <img src={executeIcon} alt="Execute" />}
        </ExecuteButton>
        <StatusDot $status={data.executed ? 'executed' : 'not-executed'} />
        {hasScore ? (
          <ScoreBadge
            $score={data.avgScore as number}
            title={`Average score ${(data.avgScore as number).toFixed(1)}/5${needsImprovement ? ' — needs improvement' : ''}`}
          >
            ★ {(data.avgScore as number).toFixed(1)}
          </ScoreBadge>
        ) : (
          <StatusLabel $status={data.executed ? 'executed' : 'not-executed'}>
            {data.executed ? 'Executed' : 'Pending'}
          </StatusLabel>
        )}
      </StatusContainer>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </CardContainer>
  );
};

export default CardNode;
