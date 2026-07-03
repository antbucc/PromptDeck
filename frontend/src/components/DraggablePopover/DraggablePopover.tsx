// src/components/DraggablePopover/DraggablePopover.tsx

import React, { useEffect, useState, ChangeEvent } from 'react';
import Draggable from 'react-draggable';
import {
  fetchCardById,
  fetchPreviousCardsOutputs,
  executeCard,
  evaluateCard,
  updateCard
} from '../../services/api';
import ReactMarkdown from 'react-markdown';
import {
  CloseButton,
  PopoverContent,
  PopoverContainer,
  Section,
  SectionTitle,
  SectionContent,
  Label,
  Value,
  ButtonContainer,
  ExecuteButton,
  EvaluateButton,
  LoadingIcon,
  EditButton,
  ResolveButton,
  TitleBand,
  CopyButton,
  ModalButton,
  OutputSection,
  ButtonGroup,
  AddPluginButton,
  ModelBadge,
  GeneratedText,
  MetricsHeading,
  MetricsGrid,
  MetricRow,
  MetricName,
  MetricBarTrack,
  MetricBarFill,
  MetricScore,
} from './DraggablePopover.styles';
import {
  executeIcon,
  evaluateIcon,
  editIcon,
  doneIcon,
  reviewIcon,
  copyIcon,
  openNewIcon,
  loadingIcon,
  addIcon,
  downloadIcon,
} from '../../assets';
import { downloadCardOutput, downloadOutputPdf } from '../../utils/download';
import { filesToAttachments } from '../../utils/fileText';
import { OUTPUT_FORMATS } from '../../config/config';
import ImageOutput from '../ImageOutput/ImageOutput';
import StructuredPromptHelper from '../StructuredPromptHelper/StructuredPromptHelper';
import { STRUCTURED_CONTEXT_TEMPLATE, CONTEXT_SECTIONS } from '../../config/promptTemplate';
import PluginSelector from '../PluginSelector/PluginSelector';
import PluginSection from '../PluginSection/PluginSection';
import { useModels } from '../../hooks/useModels';
import ModelOptions from '../ModelOptions/ModelOptions';

interface DraggablePopoverProps {
  cardId: string;
  onRequestClose: () => void;
  index: number;
  onExecute: (id: string) => void;
  onCardUpdate: (card: any) => void;
  onOpenModal: (plugin: string, card: any) => void; // Updated to pass plugin and card data
}

const DraggablePopover: React.FC<DraggablePopoverProps> = ({
  cardId,
  onRequestClose,
  index,
  onExecute,
  onCardUpdate,
  onOpenModal // Updated to handle modal opening
}) => {
  const { groups: modelGroups } = useModels();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isPromptCollapsed, setIsPromptCollapsed] = useState(false);
  const [isContextCollapsed, setIsContextCollapsed] = useState(true);
  const [isExampleOutputCollapsed, setIsExampleOutputCollapsed] = useState(true);
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(true);
  const [previousCardsOutputs, setPreviousCardsOutputs] = useState<{ [key: string]: string | null }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [updatedCard, setUpdatedCard] = useState<any>({});
  const [isCopying, setIsCopying] = useState(false);
  const [plugins, setPlugins] = useState<string[]>([]);
  const [isPluginSelectorVisible, setIsPluginSelectorVisible] = useState(false);

  useEffect(() => {
    const getCard = async () => {
      try {
        const data = await fetchCardById(cardId);
        setCard(data);
        setUpdatedCard(data);
        setPlugins(data.plugins || []);
      } catch (err) {
        setError('Failed to fetch card. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getCard();
  }, [cardId]);

  useEffect(() => {
    const getPreviousCardsOutputs = async () => {
      try {
        const data = await fetchPreviousCardsOutputs(cardId);
        setPreviousCardsOutputs(data);
      } catch (err) {
        console.error('Failed to fetch previous cards outputs', err);
      }
    };

    if (card) {
      getPreviousCardsOutputs();
    }
  }, [card]);

  const handlePluginAdded = async () => {
    const data = await fetchCardById(cardId);
    setCard(data);
    setPlugins(data.plugins || []);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const calculateLeftPosition = (index: number) => {
    const position = (index * 33 + 2) % 100;
    return position <= 75 ? position : 0;
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setIsEvaluating(true);
    try {
      await executeCard(cardId);
      const updatedCard = await fetchCardById(cardId);
      setCard(updatedCard);
      onCardUpdate(updatedCard);
    } catch (error) {
      console.error('Error executing card:', error);
    } finally {
      setIsExecuting(false);
      setIsEvaluating(false);
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setIsExecuting(true);
    try {
      await evaluateCard(cardId);
      const updatedCard = await fetchCardById(cardId);
      setCard(updatedCard);
      onExecute(cardId);
      onCardUpdate(updatedCard);
    } catch (error) {
      console.error('Error evaluating card:', error);
    } finally {
      setIsEvaluating(false);
      setIsExecuting(false);
    }
  };

  const handleEditClick = async () => {
    if (isEditing) {
      try {
        await updateCard(updatedCard);
        setCard(updatedCard);
        onCardUpdate(updatedCard);
      } catch (error) {
        console.error('Error updating card:', error);
      }
    }
    setIsEditing(!isEditing);
    setIsContextCollapsed(false);
    setIsPromptCollapsed(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdatedCard((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleResolveInconsistency = async () => {
    try {
      const resolvedCard = { ...updatedCard, inconsistent: false };
      await updateCard(resolvedCard);
      setCard(resolvedCard);
      onCardUpdate(resolvedCard);
    } catch (error) {
      console.error('Error resolving inconsistency:', error);
    }
  };

  const handleCopyClick = async () => {
    if (card && card.output && card.output.generatedText) {
      try {
        await navigator.clipboard.writeText(card.output.generatedText);
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 2000);
      } catch (error) {
        console.error('Failed to copy text:', error);
      }
    }
  };

  const handleDownloadClick = () => {
    if (card && card.output && card.output.generatedText) {
      downloadCardOutput(card.title || 'card-output', card.output.generatedText, card.outputFormat);
    }
  };

  const handlePdfClick = () => {
    if (card && card.output && card.output.generatedText) {
      downloadOutputPdf(card.title || 'card-output', card.output.generatedText);
    }
  };

  const handleEditFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = await filesToAttachments(Array.from(e.target.files || []));
    if (parsed.length) setUpdatedCard((prev: any) => ({ ...prev, attachments: [...(prev.attachments || []), ...parsed] }));
    e.target.value = '';
  };

  const removeEditAttachment = (i: number) =>
    setUpdatedCard((prev: any) => ({ ...prev, attachments: (prev.attachments || []).filter((_: any, idx: number) => idx !== i) }));

  const handleModalOpen = (plugin: string) => {
    onOpenModal(plugin, card);
  };

  return (
    <Draggable handle=".draggable-handle" bounds="parent">
      <PopoverContainer
        style={{
          top: '10%',
          left: `${calculateLeftPosition(index)}%`,
          transform: 'translateX(-50%)',
        }}
      >
        <TitleBand className="draggable-handle">Card Details</TitleBand>
        <CloseButton onClick={onRequestClose}>×</CloseButton>
        <ResolveButton onClick={handleResolveInconsistency}>
          <img src={reviewIcon} alt="Resolve" />
        </ResolveButton>
        <EditButton onClick={handleEditClick}>
          <img src={isEditing ? doneIcon : editIcon} alt="Edit" />
        </EditButton>
        {card && (
          <>
            <PopoverContent>
              <Section>
                <Label>Title:</Label>
                {isEditing ? (
                  <input
                    type="text"
                    name="title"
                    value={updatedCard.title}
                    onChange={handleChange}
                  />
                ) : (
                  <Value>{card.title}</Value>
                )}
              </Section>
              <Section>
                <Label>Objective:</Label>
                {isEditing ? (
                  <input
                    type="text"
                    name="objective"
                    value={updatedCard.objective}
                    onChange={handleChange}
                  />
                ) : (
                  <Value>{card.objective}</Value>
                )}
              </Section>
              <Section>
                <Label>Generative Model:</Label>
                {isEditing ? (
                  <select
                    name="generativeModel"
                    value={updatedCard.generativeModel}
                    onChange={handleChange}
                  >
                    <ModelOptions groups={modelGroups} />
                  </select>
                ) : (
                  <ModelBadge>{card.generativeModel}</ModelBadge>
                )}
              </Section>
              <Section>
                <Label>Output format:</Label>
                {isEditing ? (
                  <select name="outputFormat" value={updatedCard.outputFormat || 'markdown'} onChange={handleChange}>
                    {OUTPUT_FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                ) : (
                  <ModelBadge>{card.outputFormat || 'markdown'}</ModelBadge>
                )}
              </Section>
              <Section>
                <Label>Input files:</Label>
                {isEditing ? (
                  <>
                    <input type="file" multiple accept=".csv,.tsv,.txt,.json,.md,.xlsx,.xls" onChange={handleEditFiles} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {(updatedCard.attachments || []).map((a: any, i: number) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eef2f7',
                          border: '1px solid #d7dee8', borderRadius: 16, padding: '3px 10px', fontSize: 12 }}>
                          📄 {a.name}
                          <span onClick={() => removeEditAttachment(i)} style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 700 }}>×</span>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <Value>
                    {card.attachments && card.attachments.length
                      ? card.attachments.map((a: any) => a.name).join(', ')
                      : 'None'}
                  </Value>
                )}
              </Section>
              <Section>
                <SectionTitle onClick={() => setIsPromptCollapsed(!isPromptCollapsed)}>
                  Prompt {isPromptCollapsed ? '▼' : '▲'}
                </SectionTitle>
                <SectionContent isCollapsed={isPromptCollapsed}>
                  <div>
                    <Label>Prompt:</Label>
                    {isEditing ? (
                      <>
                        <StructuredPromptHelper
                          value={updatedCard.prompt || ''}
                          onChange={(next) => setUpdatedCard({ ...updatedCard, prompt: next })}
                          generativeModel={updatedCard.generativeModel}
                        />
                        <textarea
                          name="prompt"
                          value={updatedCard.prompt}
                          onChange={handleChange}
                        ></textarea>
                      </>
                    ) : (
                      <Value>
                        <ReactMarkdown>{card.prompt}</ReactMarkdown>
                      </Value>
                    )}
                  </div>
                </SectionContent>
              </Section>
              <Section>
                <SectionTitle onClick={() => setIsContextCollapsed(!isContextCollapsed)}>
                  Context {isContextCollapsed ? '▼' : '▲'}
                </SectionTitle>
                <SectionContent isCollapsed={isContextCollapsed}>
                  <div>
                    <Label>Context:</Label>
                    {isEditing ? (
                      <>
                        <StructuredPromptHelper
                          value={updatedCard.context || ''}
                          onChange={(next) => setUpdatedCard({ ...updatedCard, context: next })}
                          kind="context"
                          template={STRUCTURED_CONTEXT_TEMPLATE}
                          sections={CONTEXT_SECTIONS}
                          enableImprove={false}
                        />
                        <textarea
                          name="context"
                          value={updatedCard.context}
                          onChange={handleChange}
                        ></textarea>
                      </>
                    ) : (
                      <Value>
                        <ReactMarkdown>{card.context}</ReactMarkdown>
                      </Value>
                    )}
                  </div>
                  {card.previousCards && Object.keys(card.previousCards).length > 0 && !isEditing && (
                    <div>
                      <Label>Previous Cards Outputs:</Label>
                      {Object.entries(previousCardsOutputs).map(([prevCardId, output]) => (
                        <div key={prevCardId}>
                          <Value>{output || 'No output generated'}</Value>
                        </div>
                      ))}
                    </div>
                  )}
                  <Section>
                    <SectionTitle onClick={() => setIsExampleOutputCollapsed(!isExampleOutputCollapsed)}>
                      Example Output {isExampleOutputCollapsed ? '▼' : '▲'}
                    </SectionTitle>
                    <SectionContent isCollapsed={isExampleOutputCollapsed}>
                      <div>
                        {isEditing ? (
                          <textarea
                            name="exampleOutput"
                            value={updatedCard.exampleOutput}
                            onChange={handleChange}
                          ></textarea>
                        ) : (
                          <Value>
                            <ReactMarkdown>{card.exampleOutput || 'No example output provided'}</ReactMarkdown>
                          </Value>
                        )}
                      </div>
                    </SectionContent>
                  </Section>
                </SectionContent>
              </Section>
              <OutputSection>
                <SectionTitle onClick={() => setIsOutputCollapsed(!isOutputCollapsed)}>
                  Output {isOutputCollapsed ? '▼' : '▲'}
                </SectionTitle>
                <ButtonGroup>
                  <CopyButton onClick={handleCopyClick}>
                    <img src={isCopying ? doneIcon : copyIcon} alt="Copy" />
                  </CopyButton>
                  <CopyButton onClick={handleDownloadClick} title={`Download output${card?.outputFormat && card.outputFormat !== 'markdown' ? ` (.${card.outputFormat === 'image' ? 'img' : card.outputFormat === 'json' ? 'json' : card.outputFormat === 'csv' ? 'csv' : 'txt'})` : ' (.md)'}`}>
                    <img src={downloadIcon} alt="Download" />
                  </CopyButton>
                  {card?.outputFormat !== 'image' && (
                    <CopyButton onClick={handlePdfClick} title="Download as PDF">
                      <span style={{ fontSize: 11, fontWeight: 700 }}>PDF</span>
                    </CopyButton>
                  )}
                  <ModalButton onClick={() => handleModalOpen('output-detail')}>
                    <img src={openNewIcon} alt="Open" />
                  </ModalButton>
                </ButtonGroup>
              </OutputSection>
              <SectionContent isCollapsed={isOutputCollapsed}>
                <div>
                  {card.output ? (
                    <>
                      <Label>{card.outputFormat === 'image' ? 'Generated Image:' : 'Generated Output:'}</Label>
                      {card.outputFormat === 'image' ? (
                        <ImageOutput src={card.output.generatedText} alt={card.title} />
                      ) : card.outputFormat === 'json' || card.outputFormat === 'csv' ? (
                        <GeneratedText as="pre" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}>
                          {card.output.generatedText}
                        </GeneratedText>
                      ) : (
                        <GeneratedText>
                          <ReactMarkdown>{card.output.generatedText}</ReactMarkdown>
                        </GeneratedText>
                      )}
                    </>
                  ) : (
                    <Value>No output generated yet</Value>
                  )}
                </div>
              </SectionContent>
              {card.output && card.output.evaluationMetrics && card.output.evaluationMetrics.length > 0 && (
                <Section>
                  <MetricsHeading>Evaluation Metrics</MetricsHeading>
                  <MetricsGrid>
                    {card.output.evaluationMetrics.map((metric: any) => {
                      const score = Number(metric.evaluationResult) || 0;
                      return (
                        <MetricRow key={metric._id}>
                          <MetricName>{metric.type}</MetricName>
                          <MetricBarTrack>
                            <MetricBarFill $pct={(score / 5) * 100} $score={score} />
                          </MetricBarTrack>
                          <MetricScore>{score.toFixed(1)}</MetricScore>
                        </MetricRow>
                      );
                    })}
                  </MetricsGrid>
                </Section>
              )}
              <Section>
                <SectionTitle>
                  Plugins
                  <AddPluginButton onClick={() => setIsPluginSelectorVisible(true)}>
                    <img src={addIcon} alt="Add Plugin" />
                  </AddPluginButton>
                </SectionTitle>
                {isPluginSelectorVisible && (
                  <PluginSelector
                    cardId={cardId}
                    onPluginAdded={handlePluginAdded}
                    onClose={() => setIsPluginSelectorVisible(false)}
                  />
                )}
                <PluginSection plugins={plugins} card={card} onOpenModal={handleModalOpen} />
              </Section>
            </PopoverContent>
            <ButtonContainer>
              <ExecuteButton
                onClick={handleExecute}
                data-tooltip="Execute Card"
                disabled={isExecuting}
              >
                {isExecuting ? <LoadingIcon src={loadingIcon} alt="Loading" /> : <img src={executeIcon} alt="Execute" />}
              </ExecuteButton>
              <EvaluateButton
                onClick={handleEvaluate}
                data-tooltip="Evaluate Card"
                disabled={isEvaluating || !card.executed}
              >
                {isEvaluating ? <LoadingIcon src={loadingIcon} alt="Loading" /> : <img src={evaluateIcon} alt="Evaluate" />}
              </EvaluateButton>
            </ButtonContainer>
          </>
        )}
      </PopoverContainer>
    </Draggable>
  );
};

export default DraggablePopover;
