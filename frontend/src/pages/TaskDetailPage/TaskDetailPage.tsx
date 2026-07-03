import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTaskById, executeCard, deleteCard, removeNextCard, selectAlternative, groupAlternatives, ungroupAlternatives } from '../../services/api';
import Flow from '../../components/Flow/Flow';
import AddCardPopover from '../../components/AddCardPopover/AddCardPopover';
import Navbar from '../../components/Navbar/Navbar';
import { Node, Edge } from 'react-flow-renderer';
import { TaskInfoContainer, TaskInfoBox, TaskInfo, ButtonsBox, RoundButton, ContentContainer, PageContainer, RunFlowButton, RunProgressBanner, MiniBarTrack, MiniBarFill, GroupButton } from './TaskDetailPage.styles';
import DraggablePopover from '../../components/DraggablePopover/DraggablePopover';
import { ReactComponent as AddIcon } from '../../assets/add.svg';
import InstructionsPopup from '../../components/InstructionsPopup/InstructionsPopup';
import DetailModal from '../../components/DetailModal/DetailModal';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [openPopovers, setOpenPopovers] = useState<string[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [modalOutput, setModalOutput] = useState<{ content: string; card: any } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [runStates, setRunStates] = useState<Record<string, 'queued' | 'running' | 'done' | 'error'>>({});
  const [running, setRunning] = useState(false);
  const [stepInfo, setStepInfo] = useState<{ i: number; total: number; title: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleDeleteEdge = async (edgeId: string) => {
    try {
      const edge = edges.find((e) => e.id === edgeId);
      if (edge) {
        const { source, target } = edge;
        await removeNextCard(source, target);
        setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      }
    } catch (error) {
      console.error('Error deleting edge:', error);
    }
  };

  const edgeOptions = {
    type: 'card',
    data: { onRemove: handleDeleteEdge },
  };

  const fetchTaskData = async () => {
    if (id) {
      try {
        const data = await fetchTaskById(id);
        setTask(data);

        const newNodes = data.cards.map((card: any, index: number) => ({
          id: card._id,
          data: {
            id: card._id,
            title: card.title,
            executed: card.executed,
            inconsistent: card.inconsistent,
            alternativeGroup: card.alternativeGroup,
            selected: card.selected,
            onExecute: handleExecute,
            onDelete: handleDelete,
            onCardUpdate: handleCardUpdate,
            onSelectAlternative: handleSelectAlternative,
            taskId: data._id,
          },
          position: { x: 200 * index, y: 100 },
          type: 'cardNode',
          draggable: true,
        }));
        setNodes(newNodes);

        const newEdges: Edge[] = [];
        data.cards.forEach((card: any) => {
          card.nextCards.forEach((nextCardId: string) => {
            newEdges.push({
              id: `e${card._id}-${nextCardId}`,
              source: card._id,
              target: nextCardId,
              ...edgeOptions,
            });
          });
          card.previousCards.forEach((prevCardId: string) => {
            newEdges.push({
              id: `e${prevCardId}-${card._id}`,
              source: prevCardId,
              target: card._id,
              ...edgeOptions,
            });
          });
        });
        // Each link appears twice (as a nextCard and a previousCard); keep one per id.
        const uniqueEdges = Array.from(new Map(newEdges.map((e) => [e.id, e])).values());
        setEdges(uniqueEdges);

        if (data.cards.length === 0) {
          setShowInstructions(true);
        }
      } catch (err) {
        setError('Failed to fetch task. Please try again later.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setError('Task ID is missing.');
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [id]);

  const handleCardCreated = () => {
    setIsPopoverOpen(false);
    fetchTaskData();
  };

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (!openPopovers.includes(node.id)) {
      setOpenPopovers((prev) => [...prev, node.id]);
    }
  }, [openPopovers]);

  const handleClosePopover = (cardId: string) => {
    setOpenPopovers((prev) => prev.filter((id) => id !== cardId));
  };

  const handleExecute = async (cardId: string) => {
    try {
      const updatedCard = await executeCard(cardId);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === updatedCard._id) {
            node.data = {
              ...node.data,
              executed: updatedCard.executed,
              inconsistent: updatedCard.inconsistent,
            };
          }
          return node;
        })
      );
      fetchTaskData();
    } catch (error) {
      console.error('Error executing card:', error);
    }
  };

  // Order the cards so every card runs after the cards it depends on
  // (topological sort over the flow edges; leftovers/cycles appended at the end).
  const computeExecutionOrder = (): string[] => {
    const ids = nodes.map((n) => n.id);
    const indeg: Record<string, number> = {};
    const adj: Record<string, string[]> = {};
    ids.forEach((id) => { indeg[id] = 0; adj[id] = []; });

    const seen = new Set<string>();
    edges.forEach((e) => {
      const key = `${e.source}->${e.target}`;
      if (seen.has(key)) return;
      if (adj[e.source] && indeg[e.target] !== undefined) {
        seen.add(key);
        adj[e.source].push(e.target);
        indeg[e.target]++;
      }
    });

    const queue = ids.filter((id) => indeg[id] === 0);
    const order: string[] = [];
    while (queue.length) {
      const id = queue.shift() as string;
      order.push(id);
      adj[id].forEach((t) => { indeg[t]--; if (indeg[t] === 0) queue.push(t); });
    }
    ids.forEach((id) => { if (!order.includes(id)) order.push(id); });
    return order;
  };

  // Execute the whole flow one card at a time, visualizing each step.
  const handleRunFlow = async () => {
    if (running || nodes.length === 0) return;
    // Skip alternatives that are not the chosen option (non-deterministic paths).
    const order = computeExecutionOrder().filter((id) => {
      const node = nodes.find((n) => n.id === id);
      return node?.data?.selected !== false;
    });

    setRunning(true);
    const initial: Record<string, 'queued' | 'running' | 'done' | 'error'> = {};
    order.forEach((id) => { initial[id] = 'queued'; });
    setRunStates(initial);

    for (let i = 0; i < order.length; i++) {
      const cardId = order[i];
      const node = nodes.find((n) => n.id === cardId);
      setStepInfo({ i: i + 1, total: order.length, title: node?.data?.title || '' });
      setRunStates((s) => ({ ...s, [cardId]: 'running' }));
      try {
        await executeCard(cardId);
        setRunStates((s) => ({ ...s, [cardId]: 'done' }));
      } catch (error) {
        console.error('Error executing card during flow run:', error);
        setRunStates((s) => ({ ...s, [cardId]: 'error' }));
      }
    }

    setRunning(false);
    setStepInfo(null);
    await fetchTaskData();
    // Clear the step overlay shortly after finishing.
    setTimeout(() => setRunStates({}), 1800);
  };

  // Choose this card as the active option among its mutually-exclusive alternatives.
  const handleSelectAlternative = async (cardId: string) => {
    try {
      await selectAlternative(cardId);
      await fetchTaskData();
    } catch (error) {
      console.error('Error selecting alternative:', error);
    }
  };

  // Are the currently multi-selected cards all in one alternative group already?
  const selectedNodes = nodes.filter((n) => selectedIds.includes(n.id));
  const selectedAllGrouped =
    selectedNodes.length >= 2 &&
    selectedNodes.every((n) => n.data?.alternativeGroup) &&
    new Set(selectedNodes.map((n) => n.data?.alternativeGroup)).size === 1;

  const handleGroupAlternatives = async () => {
    try {
      await groupAlternatives(selectedIds);
      setSelectedIds([]);
      await fetchTaskData();
    } catch (error) {
      console.error('Error grouping alternatives:', error);
    }
  };

  const handleUngroupAlternatives = async () => {
    try {
      await ungroupAlternatives(selectedIds);
      setSelectedIds([]);
      await fetchTaskData();
    } catch (error) {
      console.error('Error ungrouping alternatives:', error);
    }
  };

  const activeCount = nodes.filter((n) => n.data?.selected !== false).length;

  const handleCardUpdate = (updatedCard: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === updatedCard._id) {
          node.data = {
            ...node.data,
            title: updatedCard.title,
            objective: updatedCard.objective,
            prompt: updatedCard.prompt,
            context: updatedCard.context,
            executed: updatedCard.executed,
            inconsistent: updatedCard.inconsistent,
          };
        }
        return node;
      })
    );
  };

  const handleDelete = async (cardId: string) => {
    try {
      await deleteCard(cardId, task._id);
      setNodes((nds) => nds.filter((node) => node.id !== cardId));
      setEdges((eds) => eds.filter((edge) => edge.source !== cardId && edge.target !== cardId));
      if (nodes.length === 1) {
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleOpenModal = (content: string, card: any) => {
    setModalOutput({ content, card });
  };

  const handleCloseModal = () => {
    setModalOutput(null);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  function closeInstructions(): void {
    setShowInstructions(false);
  }

  return (
    <PageContainer>
      <Navbar />
      <TaskInfoContainer>
        <TaskInfoBox>
          <TaskInfo>
            <h1>{task.name}</h1>
            <p>{task.objective}</p>
          </TaskInfo>
        </TaskInfoBox>
        <ButtonsBox>
          <RoundButton onClick={() => setIsPopoverOpen(true)}>
            <AddIcon className="icon" />
          </RoundButton>
          <RunFlowButton onClick={handleRunFlow} disabled={running || nodes.length === 0}>
            {running ? '⏳ Running…' : `▶ Run flow (${activeCount})`}
          </RunFlowButton>
          {selectedIds.length >= 2 && (
            selectedAllGrouped ? (
              <GroupButton onClick={handleUngroupAlternatives}>⛌ Ungroup ({selectedIds.length})</GroupButton>
            ) : (
              <GroupButton onClick={handleGroupAlternatives}>⑃ Group as alternatives ({selectedIds.length})</GroupButton>
            )
          )}
        </ButtonsBox>
      </TaskInfoContainer>
      {stepInfo && (
        <RunProgressBanner>
          <span>
            Step {stepInfo.i}/{stepInfo.total}: {stepInfo.title || '…'}
          </span>
          <MiniBarTrack>
            <MiniBarFill $p={(stepInfo.i / stepInfo.total) * 100} />
          </MiniBarTrack>
        </RunProgressBanner>
      )}
      <ContentContainer>
        <Flow initialNodes={nodes} initialEdges={edges} onNodeClick={handleNodeClick} onExecute={handleExecute} runStates={runStates} onSelectionChange={setSelectedIds} />
      </ContentContainer>
      <AddCardPopover isOpen={isPopoverOpen} onRequestClose={() => setIsPopoverOpen(false)} taskId={task._id} currentCards={task.cards} onCardCreated={handleCardCreated} />
      {openPopovers.map((cardId, index) => (
        <DraggablePopover
          key={cardId}
          cardId={cardId}
          onRequestClose={() => handleClosePopover(cardId)}
          index={index}
          onExecute={handleExecute}
          onCardUpdate={handleCardUpdate}
          onOpenModal={handleOpenModal}
        />
      ))}
      {modalOutput && (
        <DetailModal
          title={modalOutput.content}
          onRequestClose={handleCloseModal}
          content={modalOutput.content}
          card={modalOutput.card}
        />
      )}
      {showInstructions && <InstructionsPopup onClose={closeInstructions} />}
    </PageContainer>
  );
};

export default TaskDetailPage;
