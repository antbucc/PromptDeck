// src/components/SettingsPanel/SettingsPanel.tsx
import React, { useEffect, useState } from 'react';
import { fetchSettings, updateSettings, fetchModels } from '../../services/api';
import {
  Overlay,
  Panel,
  PanelTitle,
  CloseX,
  Field,
  FieldLabel,
  Input,
  Status,
  Row,
  SaveButton,
  ClearButton,
  Note,
} from './SettingsPanel.styles';

interface SettingsPanelProps {
  onClose: () => void;
  // Called after a successful save so the model dropdowns can refresh availability.
  onSaved?: () => void;
}

interface ProviderStatus {
  configured: boolean;
  masked?: string;
  fromUi?: boolean;
  note?: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, onSaved }) => {
  const [anthropic, setAnthropic] = useState<ProviderStatus>({ configured: false });
  const [openai, setOpenai] = useState<ProviderStatus>({ configured: false });
  const [keyInput, setKeyInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [modelInfo, setModelInfo] = useState<{ models: any[]; defaultModel: string }>({ models: [], defaultModel: '' });

  const load = async () => {
    try {
      const data = await fetchSettings();
      setAnthropic(data.anthropic);
      setOpenai(data.openai);
    } catch {
      setMessage('Could not load settings (is the backend running?).');
    }
    try {
      const md = await fetchModels();
      setModelInfo({ models: md.models || [], defaultModel: md.defaultModel || '' });
    } catch {
      /* provider status just won't show */
    }
  };

  const providerAvailable = (p: string) => modelInfo.models.some((m) => m.provider === p && m.available);
  const defaultEntry = modelInfo.models.find((m) => m.value === modelInfo.defaultModel);

  useEffect(() => { load(); }, []);

  const save = async (clear = false) => {
    setSaving(true);
    setMessage('');
    try {
      const data = await updateSettings({ anthropicApiKey: clear ? '' : keyInput.trim() });
      setAnthropic(data.anthropic);
      setOpenai(data.openai);
      setKeyInput('');
      setMessage(clear ? 'Anthropic key cleared.' : 'Saved.');
      try {
        const md = await fetchModels();
        setModelInfo({ models: md.models || [], defaultModel: md.defaultModel || '' });
      } catch { /* ignore */ }
      onSaved?.();
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <CloseX onClick={onClose}>×</CloseX>
        <PanelTitle>Model Provider Settings</PanelTitle>

        <Field>
          <FieldLabel>Active default model</FieldLabel>
          <Status $ok={!!defaultEntry?.available}>
            {defaultEntry
              ? `${defaultEntry.label} · ${defaultEntry.provider}${defaultEntry.available ? ' · available' : ' · NOT available here'}`
              : (modelInfo.defaultModel || '—')}
          </Status>
          <Note>Preselected when creating cards/tasks. Change it on the server via the DEFAULT_MODEL env var (e.g. LLAMA_3_1 for Ollama).</Note>
        </Field>

        <Field>
          <FieldLabel>Providers</FieldLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { id: 'ollama', label: 'Ollama — local/self-hosted (free, no limits)', okWord: 'reachable', noWord: 'not reachable' },
              { id: 'groq', label: 'Groq — cloud (free tier)', okWord: 'configured', noWord: 'not configured' },
              { id: 'anthropic', label: 'Claude — Anthropic', okWord: 'configured', noWord: 'not configured' },
              { id: 'openai', label: 'GPT — Azure OpenAI', okWord: 'configured', noWord: 'not configured' },
            ].map((p) => {
              const ok = providerAvailable(p.id);
              return (
                <Status key={p.id} $ok={ok}>
                  {ok ? '● ' : '○ '}{p.label} — {ok ? p.okWord : p.noWord}
                </Status>
              );
            })}
          </div>
        </Field>

        <Field>
          <FieldLabel>Anthropic (Claude) API key</FieldLabel>
          <Status $ok={anthropic.configured}>
            {anthropic.configured
              ? `Configured ${anthropic.fromUi ? '(via UI)' : '(via .env)'} · ${anthropic.masked}`
              : 'Not configured — Claude models are disabled'}
          </Status>
          <Input
            type="password"
            placeholder="sk-ant-..."
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            autoComplete="off"
          />
          <Row>
            <SaveButton disabled={saving || !keyInput.trim()} onClick={() => save(false)}>
              {saving ? 'Saving…' : 'Save key'}
            </SaveButton>
            {anthropic.fromUi && (
              <ClearButton disabled={saving} onClick={() => save(true)}>
                Clear
              </ClearButton>
            )}
          </Row>
          <Note>Get a key at console.anthropic.com/settings/keys. Stored server-side.</Note>
        </Field>

        <Field>
          <FieldLabel>Azure OpenAI (GPT)</FieldLabel>
          <Status $ok={openai.configured}>
            {openai.configured ? 'Configured via .env' : 'Not configured — GPT models are disabled'}
          </Status>
          <Note>{openai.note || 'Set in backend/.env (key, endpoint, deployments).'}</Note>
        </Field>

        {message && <Note>{message}</Note>}
      </Panel>
    </Overlay>
  );
};

export default SettingsPanel;
