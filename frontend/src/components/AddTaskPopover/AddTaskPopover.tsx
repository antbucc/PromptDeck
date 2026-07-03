import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { createTask } from '../../services/api';
import { useModels } from '../../hooks/useModels';
import ModelOptions from '../ModelOptions/ModelOptions';
import {
  FormContainer,
  FormLabel,
  FormInput,
  FormButton,
  CloseButton,
  TitleBand,
  CheckboxLabel,
  FormSelect,
  LoadingModal,
  LoadingText,
  Spinner,
  ProgressTrack,
  ProgressFill,
  StageText,
  ElapsedText,
} from './AddTaskPopover.styles'; // Reuse styles

interface AddTaskPopoverProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onTaskCreated: () => void;
}

const AddTaskPopover: React.FC<AddTaskPopoverProps> = ({
  isOpen,
  onRequestClose,
  onTaskCreated,
}) => {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [generate, setGenerate] = useState(false);
  const [generativeModel, setGenerativeModel] = useState('GROQ_LLAMA_3_3_70B');
  const { groups: modelGroups } = useModels();

  // Default to Groq 70B (reliable for task generation), auto-correcting to the
  // first available model if that choice isn't usable in this environment.
  useEffect(() => {
    const available = modelGroups.flatMap((g) => g.models).filter((m) => m.available);
    if (available.length && !available.some((m) => m.value === generativeModel)) {
      setGenerativeModel(available[0].value);
    }
  }, [modelGroups]);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Look up the selected model's metadata (label + whether it runs locally).
  const allModels = modelGroups.flatMap((g) => g.models);
  const selectedModel = allModels.find((m) => m.value === generativeModel);
  const modelLabel = selectedModel?.label || generativeModel;
  const isLocal = selectedModel?.provider === 'ollama';

  // Local models are much slower; use a longer estimate so the bar paces sensibly.
  const estimateSec = isLocal ? 80 : 25;

  // Tick an elapsed-seconds counter while a task is being generated.
  useEffect(() => {
    if (!isLoading) {
      setElapsed(0);
      return;
    }
    const started = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(id);
  }, [isLoading]);

  // Asymptotic progress that approaches but never reaches 100% until done.
  const percent = Math.min(95, Math.round(95 * (1 - Math.exp(-elapsed / (estimateSec * 0.55)))));
  const stage =
    percent < 15 ? 'Analyzing your objective…'
      : percent < 45 ? 'Designing the card sequence…'
        : percent < 85 ? `Generating cards with ${modelLabel}…`
          : 'Linking and finalizing cards…';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const newTask = {
      name,
      objective,
      generate,
      generativeModel: generate ? generativeModel : undefined,
    };

    try {
      await createTask(newTask);
      onTaskCreated();
      onRequestClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Draggable handle=".draggable-handle" bounds="parent">
      <FormContainer style={{ top: '10%', left: '10%' }}>
        <TitleBand className="draggable-handle">Create New Task</TitleBand>
        <CloseButton onClick={onRequestClose}>×</CloseButton>
        <form onSubmit={handleSubmit}>
          <FormLabel>
            Name:
            <FormInput type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </FormLabel>
          <FormLabel>
            Objective:
            <FormInput type="text" value={objective} onChange={(e) => setObjective(e.target.value)} required />
          </FormLabel>
          <CheckboxLabel>
            <input type="checkbox" checked={generate} onChange={(e) => setGenerate(e.target.checked)} />
            Generate cards automatically
          </CheckboxLabel>
          {generate && (
            <FormLabel>
              Generative Model:
              <FormSelect value={generativeModel} onChange={(e) => setGenerativeModel(e.target.value)}>
                <ModelOptions groups={modelGroups} />
              </FormSelect>
            </FormLabel>
          )}
          <FormButton type="submit">Create Task</FormButton>
        </form>
        {isLoading && (
          <LoadingModal>
            <Spinner />
            <LoadingText>Generating your task…</LoadingText>
            <ProgressTrack>
              <ProgressFill $percent={percent} />
            </ProgressTrack>
            <StageText>{stage}</StageText>
            <ElapsedText>
              {percent}% · {elapsed}s elapsed
              {isLocal ? ' · local model, this can take ~1 minute' : ''}
            </ElapsedText>
          </LoadingModal>
        )}
      </FormContainer>
    </Draggable>
  );
};

export default AddTaskPopover;
