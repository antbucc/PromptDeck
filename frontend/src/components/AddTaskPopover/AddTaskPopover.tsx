import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import * as XLSX from 'xlsx';
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

const MAX_GROUNDING = 15000;

// Extract plain text from a supported document (CSV/TSV/TXT/JSON/MD or Excel).
const extractText = async (file: File): Promise<string> => {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    return wb.SheetNames.map((n) => `# Sheet: ${n}\n${XLSX.utils.sheet_to_csv(wb.Sheets[n])}`).join('\n\n');
  }
  return await file.text();
};

const AddTaskPopover: React.FC<AddTaskPopoverProps> = ({ isOpen, onRequestClose, onTaskCreated }) => {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [generate, setGenerate] = useState(false);
  const [generativeModel, setGenerativeModel] = useState('GROQ_LLAMA_3_3_70B');
  const { groups: modelGroups, loading: modelsLoading } = useModels();

  // Grounding fields (only used when generating a flow).
  const [audience, setAudience] = useState('');
  const [background, setBackground] = useState('');
  const [constraints, setConstraints] = useState('');
  const [desiredOutput, setDesiredOutput] = useState('');
  const [docs, setDocs] = useState<{ name: string; text: string }[]>([]);
  const [docError, setDocError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');

  // Default to Groq 70B; only after the real model list has loaded, auto-correct
  // to the first available model if the default isn't usable here. (Skipping the
  // initial fallback list prevents wrongly switching away from the default.)
  useEffect(() => {
    if (modelsLoading) return;
    const available = modelGroups.flatMap((g) => g.models).filter((m) => m.available);
    if (available.length && !available.some((m) => m.value === generativeModel)) {
      setGenerativeModel(available[0].value);
    }
  }, [modelGroups, modelsLoading]);

  const allModels = modelGroups.flatMap((g) => g.models);
  const selectedModel = allModels.find((m) => m.value === generativeModel);
  const modelLabel = selectedModel?.label || generativeModel;
  const isLocal = selectedModel?.provider === 'ollama';
  const estimateSec = isLocal ? 80 : 25;

  useEffect(() => {
    if (!isLoading) { setElapsed(0); return; }
    const started = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(id);
  }, [isLoading]);

  const percent = Math.min(95, Math.round(95 * (1 - Math.exp(-elapsed / (estimateSec * 0.55)))));
  const stage =
    percent < 15 ? 'Analyzing your objective…'
      : percent < 45 ? 'Designing the card sequence…'
        : percent < 85 ? `Generating cards with ${modelLabel}…`
          : 'Linking and finalizing cards…';

  const groundingChars = docs.reduce((n, d) => n + d.text.length, 0);

  const composeGrounding = (): string => {
    let txt = docs.map((d) => `=== ${d.name} ===\n${d.text}`).join('\n\n');
    if (txt.length > MAX_GROUNDING) txt = txt.slice(0, MAX_GROUNDING) + '\n…[truncated]';
    return txt;
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocError('');
    const files = Array.from(e.target.files || []);
    const parsed: { name: string; text: string }[] = [];
    for (const f of files) {
      try {
        const text = (await extractText(f)).trim();
        parsed.push({ name: f.name, text });
      } catch {
        setDocError(`Could not read "${f.name}" (unsupported or corrupt).`);
      }
    }
    if (parsed.length) setDocs((prev) => [...prev, ...parsed]);
    e.target.value = '';
  };

  const removeDoc = (i: number) => setDocs((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const newTask: any = { name, objective, generate };
    if (generate) {
      newTask.generativeModel = generativeModel;
      if (audience.trim()) newTask.audience = audience.trim();
      if (background.trim()) newTask.background = background.trim();
      if (constraints.trim()) newTask.constraints = constraints.trim();
      if (desiredOutput.trim()) newTask.desiredOutput = desiredOutput.trim();
      if (docs.length) newTask.groundingText = composeGrounding();
    }

    try {
      await createTask(newTask);
      onTaskCreated();
      onRequestClose();
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err?.response?.data?.message || 'Task creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const modeBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    border: active ? 'none' : '1px solid #cbd5e1',
    background: active ? 'linear-gradient(135deg, #ffa63d 0%, #ff7a18 100%)' : '#f8fafc',
    color: active ? '#fff' : '#334155',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  });
  const areaStyle: React.CSSProperties = { minHeight: '54px', resize: 'vertical' };

  return (
    <Draggable handle=".draggable-handle" bounds="parent">
      <FormContainer style={{ top: '8%', left: '10%', maxHeight: '84vh' }}>
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

          {/* Choice: start empty vs generate the flow with AI. */}
          <div style={{ display: 'flex', gap: '8px', margin: '12px 0 6px' }}>
            <button type="button" style={modeBtn(!generate)} onClick={() => setGenerate(false)}>🗒️ Empty task</button>
            <button type="button" style={modeBtn(generate)} onClick={() => setGenerate(true)}>✨ Generate flow with AI</button>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
            {generate
              ? 'The AI builds a connected flow of cards. Add guidance and documents below for a more grounded result.'
              : 'Creates an empty task — you add and connect the cards yourself.'}
          </div>

          {generate && (
            <>
              <FormLabel>
                Generative Model:
                <FormSelect value={generativeModel} onChange={(e) => setGenerativeModel(e.target.value)}>
                  <ModelOptions groups={modelGroups} />
                </FormSelect>
              </FormLabel>
              <FormLabel>
                Audience: <span style={{ color: '#94a3b8', fontWeight: 400 }}>(who is this for?)</span>
                <FormInput type="text" value={audience} placeholder="e.g. non-technical stakeholders"
                  onChange={(e) => setAudience(e.target.value)} />
              </FormLabel>
              <FormLabel>
                Background / context:
                <FormInput as="textarea" style={areaStyle} value={background}
                  placeholder="domain background the flow should assume"
                  onChange={(e: any) => setBackground(e.target.value)} />
              </FormLabel>
              <FormLabel>
                Constraints:
                <FormInput as="textarea" style={areaStyle} value={constraints}
                  placeholder="e.g. GDPR compliant, max 8 cards, formal tone"
                  onChange={(e: any) => setConstraints(e.target.value)} />
              </FormLabel>
              <FormLabel>
                Desired output / structure:
                <FormInput as="textarea" style={areaStyle} value={desiredOutput}
                  placeholder="e.g. each card outputs a Markdown section; end with a summary"
                  onChange={(e: any) => setDesiredOutput(e.target.value)} />
              </FormLabel>

              <FormLabel>
                Grounding documents: <span style={{ color: '#94a3b8', fontWeight: 400 }}>(CSV, Excel, TXT, JSON)</span>
                <input type="file" multiple accept=".csv,.tsv,.txt,.json,.md,.xlsx,.xls" onChange={handleFiles} />
              </FormLabel>
              {docs.length > 0 && (
                <div style={{ margin: '4px 0 8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {docs.map((d, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eef2f7',
                      border: '1px solid #d7dee8', borderRadius: '16px', padding: '3px 10px', fontSize: '12px' }}>
                      📄 {d.name} <span style={{ color: '#94a3b8' }}>{d.text.length.toLocaleString()} ch</span>
                      <span onClick={() => removeDoc(i)} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 700 }}>×</span>
                    </span>
                  ))}
                </div>
              )}
              {groundingChars > MAX_GROUNDING && (
                <div style={{ fontSize: '11px', color: '#b45309' }}>
                  ~{groundingChars.toLocaleString()} chars — will be truncated to {MAX_GROUNDING.toLocaleString()} to fit the model.
                </div>
              )}
              {docError && <div style={{ fontSize: '11px', color: '#b3261e' }}>{docError}</div>}
            </>
          )}

          {error && (
            <div style={{
              margin: '8px 0', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, color: '#b3261e', fontSize: 13, lineHeight: 1.4,
            }}>
              ⚠ {error}
            </div>
          )}
          <FormButton type="submit">{generate ? 'Generate flow' : 'Create empty task'}</FormButton>
        </form>
        {isLoading && (
          <LoadingModal>
            <Spinner />
            <LoadingText>{generate ? 'Generating your task…' : 'Creating task…'}</LoadingText>
            {generate && (
              <>
                <ProgressTrack>
                  <ProgressFill $percent={percent} />
                </ProgressTrack>
                <StageText>{stage}</StageText>
                <ElapsedText>
                  {percent}% · {elapsed}s elapsed
                  {isLocal ? ' · local model, this can take ~1 minute' : ''}
                </ElapsedText>
              </>
            )}
          </LoadingModal>
        )}
      </FormContainer>
    </Draggable>
  );
};

export default AddTaskPopover;
