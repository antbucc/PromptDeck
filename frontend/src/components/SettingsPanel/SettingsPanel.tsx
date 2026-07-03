// src/components/SettingsPanel/SettingsPanel.tsx
import React, { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../../services/api';
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

  const load = async () => {
    try {
      const data = await fetchSettings();
      setAnthropic(data.anthropic);
      setOpenai(data.openai);
    } catch {
      setMessage('Could not load settings (is the backend running?).');
    }
  };

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

        <Field>
          <FieldLabel>Llama 3.1 (local, free)</FieldLabel>
          <Status $ok={true}>No API key needed — runs locally via Ollama.</Status>
        </Field>

        {message && <Note>{message}</Note>}
      </Panel>
    </Overlay>
  );
};

export default SettingsPanel;
