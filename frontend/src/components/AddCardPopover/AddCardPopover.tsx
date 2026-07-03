import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import {
  FormContainer,
  FormLabel,
  FormInput,
  FormTextArea,
  FormButton,
  CloseButton,
  TitleBand,
} from './AddCardPopover.styles';
import { createCard } from '../../services/api';
import { useModels } from '../../hooks/useModels';
import ModelOptions from '../ModelOptions/ModelOptions';
import StructuredPromptHelper from '../StructuredPromptHelper/StructuredPromptHelper';
import { STRUCTURED_CONTEXT_TEMPLATE, CONTEXT_SECTIONS } from '../../config/promptTemplate';

interface AddCardPopoverProps {
  isOpen: boolean;
  onRequestClose: () => void;
  taskId: string;
  currentCards: any[];
  onCardCreated: () => void;
}

const AddCardPopover: React.FC<AddCardPopoverProps> = ({
  isOpen,
  onRequestClose,
  taskId,
  onCardCreated,
}) => {
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [exampleOutput, setExampleOutput] = useState('');
  const [generativeModel, setGenerativeModel] = useState('GROQ_LLAMA_3_3_70B');
  const { groups: modelGroups, loading: modelsLoading } = useModels();

  // Default to Groq 70B; only after the real model list loads, auto-correct to the
  // first available model if the default isn't usable (skip the initial fallback).
  useEffect(() => {
    if (modelsLoading) return;
    const available = modelGroups.flatMap((g) => g.models).filter((m) => m.available);
    if (available.length && !available.some((m) => m.value === generativeModel)) {
      setGenerativeModel(available[0].value);
    }
  }, [modelGroups, modelsLoading]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newCard = {
      title,
      objective,
      generativeModel,
      prompt,
      context,
      exampleOutput,
      taskId,
    };

    try {
      await createCard(newCard);
      onCardCreated();
      onRequestClose();
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Draggable handle=".draggable-handle" bounds="parent">
      <FormContainer style={{ top: '10%', left: '10%' }}>
        <TitleBand className="draggable-handle">Create New Card</TitleBand>
        <CloseButton onClick={onRequestClose}>×</CloseButton>
        <form onSubmit={handleSubmit}>
          <FormLabel>
            Title:
            <FormInput type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </FormLabel>
          <FormLabel>
            Objective:
            <FormInput type="text" value={objective} onChange={(e) => setObjective(e.target.value)} required />
          </FormLabel>
          <FormLabel>
            Generative Model:
            <FormInput as="select" value={generativeModel} onChange={(e) => setGenerativeModel(e.target.value)}>
              <ModelOptions groups={modelGroups} />
            </FormInput>
          </FormLabel>
          <FormLabel>
            Prompt:
            <StructuredPromptHelper value={prompt} onChange={setPrompt} generativeModel={generativeModel} />
            <FormTextArea value={prompt} onChange={(e) => setPrompt(e.target.value)} required></FormTextArea>
          </FormLabel>
          <FormLabel>
            Context:
            <StructuredPromptHelper
              value={context}
              onChange={setContext}
              kind="context"
              template={STRUCTURED_CONTEXT_TEMPLATE}
              sections={CONTEXT_SECTIONS}
              enableImprove={false}
            />
            <FormTextArea value={context} onChange={(e) => setContext(e.target.value)}></FormTextArea>
          </FormLabel>
          <FormLabel>
            Example Output:
            <FormTextArea value={exampleOutput} onChange={(e) => setExampleOutput(e.target.value)}></FormTextArea>
          </FormLabel>
          <FormButton type="submit">Create Card</FormButton>
        </form>
      </FormContainer>
    </Draggable>
  );
};

export default AddCardPopover;
