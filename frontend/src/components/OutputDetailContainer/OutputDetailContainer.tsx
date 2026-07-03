import React, { useState, ChangeEvent, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { updateCardOutput, fetchCardById } from '../../services/api';
import { 
  ModalContent, 
  CopyButton, 
  ToggleContainer, 
  ToggleButton, 
  InfoLabel, 
  ButtonContainer,
  EditButton,
  SaveButton,
  TextArea // Import the TextArea component
} from './OutputDetailContainer.styles';
import { copyIcon, doneIcon, editIcon, downloadIcon } from '../../assets';
import { downloadCardOutput } from '../../utils/download';

interface OutputDetailContainerProps {
  card: any;
}

const OutputDetailContainer: React.FC<OutputDetailContainerProps> = ({ card }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isMarkdown, setIsMarkdown] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [output, setOutput] = useState('');
  const [editedOutput, setEditedOutput] = useState('');

  useEffect(() => {
    const fetchCardOutput = async () => {
      try {
        const fetchedCard = await fetchCardById(card._id);
        setOutput(fetchedCard.output.generatedText || '');
        setEditedOutput(fetchedCard.output.generatedText || '');
      } catch (error) {
        console.error('Failed to fetch card output:', error);
      }
    };

    fetchCardOutput();
  }, [card._id]);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const toggleDisplayMode = () => {
    setIsMarkdown(!isMarkdown);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      await updateCardOutput(card._id, { generatedText: editedOutput });
      setOutput(editedOutput);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update card output:', error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditedOutput(e.target.value);
  };

  const handleDownloadClick = () => {
    downloadCardOutput(card.title || 'card-output', output);
  };

  return (
    <ModalContent>
      <ToggleContainer>
        <InfoLabel>If the output is not displayed correctly, click here to show it raw:</InfoLabel>
        <ToggleButton onClick={toggleDisplayMode}>
          {isMarkdown ? 'Show Raw' : 'Show Markdown'}
        </ToggleButton>
      </ToggleContainer>
      {isEditing ? (
        <TextArea value={editedOutput} onChange={handleChange} />
      ) : (
        isMarkdown ? <ReactMarkdown>{output}</ReactMarkdown> : <pre>{output}</pre>
      )}
      <ButtonContainer>
        <CopyButton onClick={handleCopyClick}>
          <img src={isCopying ? doneIcon : copyIcon} alt="Copy" />
        </CopyButton>
        <CopyButton onClick={handleDownloadClick} title="Download output">
          <img src={downloadIcon} alt="Download" />
        </CopyButton>
        {isEditing ? (
          <SaveButton onClick={handleSaveClick}>
            <img src={doneIcon} alt="Save" />
          </SaveButton>
        ) : (
          <EditButton onClick={handleEditClick}>
            <img src={editIcon} alt="Edit" />
          </EditButton>
        )}
      </ButtonContainer>
    </ModalContent>
  );
};

export default OutputDetailContainer;
