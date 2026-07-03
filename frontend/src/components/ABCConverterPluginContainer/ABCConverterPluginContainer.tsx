// src/ABCConverterContainer.tsx

import 'abcjs/abcjs-audio.css';
import React, { useEffect, useRef, useState } from 'react';
import abcjs from 'abcjs';
import {
  ABCConverterContainerWrapper,
  OutputContainer,
  CopyButton,
  ButtonGroup,
} from './ABCConverterPluginContainer.styles';
import { copyIcon, doneIcon } from '../../assets';
import { downloadDataUri, safeFileName } from '../../utils/download';

interface ABCConverterContainerProps {
  card: any;
}

const cleanABCOutput = (output: string): string => {
  const lines = output.split('\n');
  const validHeaders = ['X', 'T', 'M', 'L', 'R', 'K'];
  const abcLines = lines.filter(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return false; // Ignore empty lines

    const headerMatch = trimmedLine.match(/^([A-Za-z]):/);
    if (headerMatch) {
      return validHeaders.includes(headerMatch[1].toUpperCase());
    }

    // Retain lines that start with music notation (A-G, a-g)
    return /^[A-Ga-g]/.test(trimmedLine) || /^[z]/.test(trimmedLine) || /\|/.test(trimmedLine);
  });

  return abcLines.join('\n');
};

const ABCConverterContainer: React.FC<ABCConverterContainerProps> = ({ card }) => {
  const [abcCode, setAbcCode] = useState<string>('');
  const [isCopying, setIsCopying] = useState(false);
  const abcjsAudioSynthRef = useRef<any>(null);
  const abcjsControlRef = useRef<any>(null);

  useEffect(() => {
    const cleanedOutput = cleanABCOutput(card.output.generatedText);
    setAbcCode(cleanedOutput);
  }, [card]);

  useEffect(() => {
    if (abcCode) {
      const visualObj = abcjs.renderAbc('abcjs-container', abcCode)[0];
      if (abcjsAudioSynthRef.current) {
        abcjsAudioSynthRef.current.stop();
      }
      abcjsAudioSynthRef.current = new abcjs.synth.CreateSynth();
      abcjsAudioSynthRef.current
        .init({
          visualObj: visualObj,
          options: {
            soundfontUrl: 'https://paulrosen.github.io/midi-js-soundfonts/abcjs/soundfont/',
          },
        })
        .then(() => {
          if (abcjsControlRef.current) {
            abcjsControlRef.current.load(abcjsAudioSynthRef.current);
          } else {
            abcjsControlRef.current = new abcjs.synth.SynthController();
            abcjsControlRef.current.load('#abcjs-audio-controls', abcjsAudioSynthRef.current, {
              displayLoop: true,
              displayRestart: true,
              displayPlay: true,
              displayProgress: true,
              displayWarp: true,
            });
          }
          abcjsControlRef.current.setTune(visualObj, true);  // Ensuring the tune is set for playback
        })
        .catch((err: any) => {
          console.warn('Synth initialization failed', err);
        });
    }
  }, [abcCode]);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(abcCode);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const baseName = safeFileName(card.title || 'music', 'music');

  // Export the rendered audio as an uncompressed WAV file via the abcjs synth.
  const handleDownloadWav = async () => {
    try {
      const synth = abcjsAudioSynthRef.current;
      if (!synth) return;
      await synth.prime(); // ensure the audio buffer is rendered
      if (abcjsControlRef.current && typeof abcjsControlRef.current.download === 'function') {
        abcjsControlRef.current.download(`${baseName}.wav`);
      } else if (typeof synth.download === 'function') {
        synth.download();
      }
    } catch (err) {
      console.error('WAV download failed:', err);
    }
  };

  // Export the tune as a standard MIDI file.
  const handleDownloadMidi = () => {
    try {
      const midi = abcjs.synth.getMidiFile(abcCode, { midiOutputType: 'encoded' });
      if (typeof midi === 'string') {
        downloadDataUri(`${baseName}.mid`, midi);
      }
    } catch (err) {
      console.error('MIDI download failed:', err);
    }
  };

  return (
    <ABCConverterContainerWrapper>
      <h2>Refined ABC Notation</h2>
      <OutputContainer>
        <pre>{abcCode}</pre>
        <ButtonGroup>
          <CopyButton onClick={handleCopyClick}>
            <img src={isCopying ? doneIcon : copyIcon} alt="Copy" />
          </CopyButton>
        </ButtonGroup>
      </OutputContainer>
      <h3>Music Representation</h3>
      <div id="abcjs-container" />
      <div id="abcjs-audio-controls" />
      <ButtonGroup style={{ marginTop: '10px', gap: '8px' }}>
        <button type="button" onClick={handleDownloadWav} title="Download audio as WAV">
          ⬇ Download audio (WAV)
        </button>
        <button type="button" onClick={handleDownloadMidi} title="Download as MIDI">
          ⬇ Download MIDI
        </button>
      </ButtonGroup>
    </ABCConverterContainerWrapper>
  );
};

export default ABCConverterContainer;
