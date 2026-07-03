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
import { OUTPUT_FORMATS } from '../../config/config';
import { filesToAttachments, Attachment } from '../../utils/fileText';

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
  const [outputFormat, setOutputFormat] = useState('markdown');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [generativeModel, setGenerativeModel] = useState('GROQ_LLAMA_3_3_70B');
  const { groups: modelGroups, loading: modelsLoading } = useModels();

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = await filesToAttachments(Array.from(e.target.files || []));
    if (parsed.length) setAttachments((prev) => [...prev, ...parsed]);
    e.target.value = '';
  };

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
      outputFormat,
      attachments,
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
            Output format:
            <FormInput as="select" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
              {OUTPUT_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </FormInput>
          </FormLabel>
          {outputFormat !== 'image' && (
            <FormLabel>
              Generative Model:
              <FormInput as="select" value={generativeModel} onChange={(e) => setGenerativeModel(e.target.value)}>
                <ModelOptions groups={modelGroups} />
              </FormInput>
            </FormLabel>
          )}
          {outputFormat === 'image' && (
            <div style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 8px' }}>
              🖼️ The prompt below describes the image to generate (free, via Pollinations — no model/key needed).
            </div>
          )}
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
          <FormLabel>
            Input files: <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 12 }}>(CSV, Excel, TXT, JSON — used as data for this card)</span>
            <input type="file" multiple accept=".csv,.tsv,.txt,.json,.md,.xlsx,.xls" onChange={handleFiles} />
          </FormLabel>
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '2px 0 8px' }}>
              {attachments.map((a, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eef2f7',
                  border: '1px solid #d7dee8', borderRadius: '16px', padding: '3px 10px', fontSize: '12px' }}>
                  📄 {a.name} <span style={{ color: '#94a3b8' }}>{a.text.length.toLocaleString()} ch</span>
                  <span onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                    style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 700 }}>×</span>
                </span>
              ))}
            </div>
          )}
          <FormButton type="submit">Create Card</FormButton>
        </form>
      </FormContainer>
    </Draggable>
  );
};

export default AddCardPopover;
