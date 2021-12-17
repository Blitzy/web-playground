import Sandbox from "../Sandbox";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useWebSpeechRecognition } from "./hooks/useWebSpeechRecognition";
import { useRevAi } from "./hooks/useRevAi";
import { useMicrophone, MicAudioData } from "./hooks/useMicrophone";

const TextArea_Width = '90%';
const TextArea_MaxWidth = '600px';
const DictationControl_Width = '75px';
const DictationControl_Height = '30px';
const DictationControl_Spacing = '8px';

enum RevAiReadyCode {

}

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

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
      }}>
        <h2>Web Speech API</h2>
        <WebSpeechDictation />
        <h2>rev.ai</h2>
        <RevAiDictation />
      </div>
    </>
  )
}

const WebSpeechDictation: React.FC = () => {

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
        <InfoBox>
          <p>This browser does not seem to support the Web Speech API.</p>
          <a href='https://caniuse.com/speech-recognition' target='_blank' >Can I Use: Speech Recognition API</a>
        </InfoBox>
      )}
    </>
  )
}

const RevAiDictation: React.FC = () => {
  const revai = useRevAi({});

  const onMicData = useCallback((data: MicAudioData) => {
    revai.send(data.buffer);
  }, []);

  const mic = useMicrophone({
    onData: onMicData,
    dataGapTarget: 500,
    sampleRate: 48000
  });

  const onStartClick = useCallback(() => {
    revai.connect({
      accessToken: import.meta.env.VITE_REVAI_ACCESS_TOKEN as string,
      sampleRate: 48000,
      format: 'F32LE',
      channels: 1,
      layout: 'non-interleaved',
    });

    mic.record();
  }, []);

  const onStopClick = useCallback(() => {
    revai.endStream();
    mic.stop();
  }, []);

  useEffect(() => {
    if (!revai.connected) {
      mic.stop();
    }
  }, [revai.connected]);

  if (!mic.supported) {
    return (
      <InfoBox>
        <h3>Not Ready...</h3>
        <p>No access to microphone.</p>
      </InfoBox>
    )
  } else {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            backgroundColor: revai.connected ? '#0f0' : '#f00',
            borderRadius: '100%',
            width: '12px',
            height: '12px',
            marginRight: '8px',
          }}/>
          <p>rev.ai service connection</p>
        </div>
        <DictationControls 
          onStart={onStartClick}
          onStop={onStopClick}
          onClear={revai.clear}
          state={mic.recording ? 'recording' : (revai.finalTranscript.length || revai.interimTranscript.length ? 'results' : 'no-results')}
        />
        <TextResultsArea id={'rev-ai-api'} showCharCount={true} value={revai.finalTranscript + revai.interimTranscript} />
      </>
    )
  }
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

const InfoBox: React.FC = (props) => {
  return (
    <div style={{
      backgroundColor: '#444',
      padding: '8px',
      width: TextArea_Width,
      maxWidth: TextArea_MaxWidth,
    }}>
      {props.children}
    </div>
  )
}