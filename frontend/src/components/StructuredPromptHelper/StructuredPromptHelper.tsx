// src/components/StructuredPromptHelper/StructuredPromptHelper.tsx
import React, { useState } from 'react';
import {
  STRUCTURED_PROMPT_TEMPLATE,
  PROMPT_SECTIONS,
  composeStructured,
  parseStructured,
} from '../../config/promptTemplate';
import { enhancePrompt } from '../../services/api';

type Section = { tag: string; hint: string; placeholder: string };

interface StructuredPromptHelperProps {
  value: string;
  onChange: (next: string) => void;
  generativeModel?: string;
  // What is being authored — drives the template, builder fields and labels.
  kind?: string;                 // e.g. 'prompt' | 'context'
  template?: string;             // scaffold inserted by "Insert template"
  sections?: Section[];          // builder fields + legend
  enableImprove?: boolean;       // show the "Improve with AI" button
}

const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#d2691e',
  cursor: 'pointer',
  font: 'inherit',
  fontSize: '12px',
  padding: 0,
  textDecoration: 'underline',
};

const panelStyle: React.CSSProperties = {
  marginTop: '6px',
  padding: '10px',
  background: '#fff7ec',
  border: '1px solid #f0d9b5',
  borderRadius: '6px',
  color: '#444',
};

/**
 * Inline helper for authoring a card prompt. Offers three aids:
 *  - Insert a semi-structured template (# ROLE / # GOAL / …)
 *  - A guided builder: one field per section, composed into the prompt
 *  - "Improve with AI": rewrites the prompt via the selected model (free or paid)
 */
const StructuredPromptHelper: React.FC<StructuredPromptHelperProps> = ({
  value,
  onChange,
  generativeModel,
  kind = 'prompt',
  template = STRUCTURED_PROMPT_TEMPLATE,
  sections = PROMPT_SECTIONS,
  enableImprove = true,
}) => {
  const [showLegend, setShowLegend] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState('');

  const insertTemplate = () => {
    if (!value || !value.trim()) {
      onChange(template);
      return;
    }
    if (window.confirm(`Append the structured template to your current ${kind}?`)) {
      onChange(`${value.trim()}\n\n${template}`);
    }
  };

  const openBuilder = () => {
    // Pre-fill the builder from whatever is already in the field.
    setFields(parseStructured(value, sections));
    setShowBuilder((s) => !s);
  };

  const applyBuilder = () => {
    const composed = composeStructured(fields, sections);
    if (composed) onChange(composed);
    setShowBuilder(false);
  };

  const handleImprove = async () => {
    if (!value || !value.trim()) {
      setError('Write something first, then improve it.');
      return;
    }
    setError('');
    setImproving(true);
    try {
      const enhanced = await enhancePrompt(value, generativeModel);
      if (enhanced) onChange(enhanced);
    } catch {
      setError('Improve failed (is the selected model available?).');
    } finally {
      setImproving(false);
    }
  };

  return (
    <div style={{ margin: '2px 0 8px', fontSize: '12px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" style={linkBtn} onClick={insertTemplate}>✨ Insert template</button>
        <button type="button" style={linkBtn} onClick={openBuilder}>
          {showBuilder ? 'Close builder' : '🧱 Guided builder'}
        </button>
        {enableImprove && (
          <button type="button" style={{ ...linkBtn, opacity: improving ? 0.6 : 1 }} onClick={handleImprove} disabled={improving}>
            {improving ? '🤖 Improving…' : '🤖 Improve with AI'}
          </button>
        )}
        <button type="button" style={linkBtn} onClick={() => setShowLegend((s) => !s)}>
          {showLegend ? 'Hide guide' : 'What is this?'}
        </button>
      </div>

      {error && <div style={{ color: '#b3261e', marginTop: '4px' }}>{error}</div>}

      {showLegend && (
        <div style={panelStyle}>
          <div style={{ marginBottom: '6px' }}>
            Write your {kind} as labelled sections — the model follows them more reliably:
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px' }}>
            {sections.map((s) => (
              <li key={s.tag} style={{ marginBottom: '2px' }}>
                <code style={{ fontWeight: 600 }}>#&nbsp;{s.tag}</code> — {s.hint}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showBuilder && (
        <div style={panelStyle}>
          <div style={{ marginBottom: '8px', fontWeight: 600 }}>Guided builder</div>
          {sections.map((s) => (
            <div key={s.tag} style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '2px' }}>{s.tag}</label>
              <div style={{ color: '#888', marginBottom: '3px' }}>{s.hint}</div>
              <textarea
                value={fields[s.tag] || ''}
                placeholder={s.placeholder}
                onChange={(e) => setFields((f) => ({ ...f, [s.tag]: e.target.value }))}
                style={{ width: '100%', minHeight: '38px', boxSizing: 'border-box', fontSize: '12px', padding: '6px' }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={applyBuilder}
            style={{ background: 'orange', border: '1px solid #333', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}
          >
            Apply to prompt
          </button>
        </div>
      )}
    </div>
  );
};

export default StructuredPromptHelper;
