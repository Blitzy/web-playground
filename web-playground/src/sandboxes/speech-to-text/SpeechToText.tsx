import Sandbox from "../Sandbox";
import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { useWebSpeechRecognition } from "./useWebSpeechRecognition";

const TextArea_Width = '90%';
const TextArea_MaxWidth = '600px';
const DictationControl_Width = '75px';
const DictationControl_Height = '30px';
const DictationControl_Spacing = '8px';

export default class SpeechToText extends Sandbox {
    loaded: boolean;

    async start(): Promise<void> {
      // Create and mount root react component.
      const root = document.createElement('div');
      root.id = 'react-root';
      document.body.append(root);
      ReactDOM.render(<SpeechToTextApp/>, root);

      this.loaded = true;
    }
}

const SpeechToTextApp: React.FC = () => {
  
  const {
    supported,
    finalTranscript,
    interimTranscript,
    recording,
    start,
    stop,
    clear,
  } = useWebSpeechRecognition({ continous: false, interimResults: true });

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
      }}>
        <h2>Web Speech API</h2>
        { supported ? (
          <>
            <DictationControls 
              onStart={start}
              onStop={stop}
              onClear={clear}
              state={recording ? 'recording' : (finalTranscript.length || interimTranscript.length ? 'results' : 'no-results')}
            />
            <TextResultsArea id={'web-speech-api'} showCharCount={true} value={finalTranscript + interimTranscript} />
          </>
        ) : (
          <div style={{
            backgroundColor: '#444',
            padding: '8px',
            width: TextArea_Width,
            maxWidth: TextArea_MaxWidth,
          }}>
            <p>This browser does not seem to support the Web Speech API.</p>
            <a href='https://caniuse.com/speech-recognition' target='_blank' >Can I Use: Speech Recognition API</a>
          </div>
        )}
      </div>
    </>
  )
}

type DictationControlsState = 'no-results' | 'recording' | 'results';

interface DictationControlsProps {
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  state: DictationControlsState;
}

const DictationControls: React.FC<DictationControlsProps> = ({
  onStart,
  onStop,
  onClear,
  state = 'no-results',
}: DictationControlsProps) => {
  return (
    <div style={{ 
      display: 'flex',
      // justifyContent: 'space-evenly',
      width: TextArea_Width,
      maxWidth: TextArea_MaxWidth,
    }}>
      <button 
        onClick={onStart}
        disabled={state === 'recording'}
        style={{ width: DictationControl_Width, height: DictationControl_Height }}
      >
        Record
      </button>
      { state === 'recording' && (
        <button 
          onClick={onStop}
          style={{ width: DictationControl_Width, height: DictationControl_Height, marginLeft: DictationControl_Spacing }}
        >
          Stop
        </button>
      )}
      { state === 'results' && (
        <button
          onClick={onClear}
          style={{ width: DictationControl_Width, height: DictationControl_Height, marginLeft: DictationControl_Spacing }}
        >
          Clear
        </button>
      )}
    </div>
  )
}

interface TextResultsAreaProps {
  id: string;
  value: string;
  showCharCount?: boolean;
  onChange?: (id: string, text: string) => void;
}

const TextResultsArea: React.FC<TextResultsAreaProps> = ({
  id,
  value,
  showCharCount = true,
}: TextResultsAreaProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      <div id={'text-area-container'} style={{
        width: TextArea_Width,
        maxWidth: TextArea_MaxWidth,
      }}>
        <textarea
          id={id}
          autoCapitalize='none'
          autoCorrect='off'
          readOnly={true}
          spellCheck={false}
          ref={textAreaRef}
          value={value}
          style={{
            boxSizing: 'border-box',
            width: '100%',
            height: '120px',
            resize: 'none',
          }}
        />
        {showCharCount && (
          <p style={{
            width: '100%',
            textAlign: 'right',
            marginTop: 0,
          }}>{value.length}</p>
        )}
      </div>
    </>
  )
}