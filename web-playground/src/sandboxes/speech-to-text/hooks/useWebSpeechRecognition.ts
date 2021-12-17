import { useCallback, useEffect, useRef, useState } from "react"


interface WebSpeechRecognition {
  supported: boolean;
  finalTranscript: string;
  interimTranscript: string;
  recording: boolean;
  start(): void;
  stop(): void;
  clear(): void;
}

interface WebSpeechRecognitionProps {
  continous: boolean;
  interimResults: boolean;
}

export const useWebSpeechRecognition = ({
  continous,
  interimResults
}: WebSpeechRecognitionProps): WebSpeechRecognition =>  {
  const [supported, setSupported] = useState(false);
  const recognition = useRef<SpeechRecognition>();
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  
  const start = useCallback(() => {
    if (recognition.current) {
      recognition.current.start();
    }
  }, [recognition]);

  const stop = useCallback(() => {
    if (recognition.current) {
      recognition.current.stop();
    }
  }, [recognition]);

  const clear = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
  }, []);

  const onRecognitionStart = useCallback(() => {
    setRecording(true);
  }, [setRecording]);

  const onRecognitionEnd = useCallback(() => {
    setFinalTranscript((prev) => { return prev + ' ' });
    setRecording(false);
  }, [setRecording]);

  const onRecognitionResult = useCallback((event: SpeechRecognitionEvent) => {
    console.log(`recognition result event: `, event);
    let newFinal = '';
    let newInterim = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        newFinal += event.results[i][0].transcript;
      } else {
        newInterim += event.results[i][0].transcript;
      }
    }

    setFinalTranscript((prev) => { return prev + newFinal});
    setInterimTranscript(newInterim);
    
  }, [setFinalTranscript, setInterimTranscript]);

  const onRecognitionError = useCallback((event: SpeechRecognitionErrorEvent) => {
    console.error(`[Speech Recognition] Error: ${event.error}, Message:  ${event.message}`);
    stop();
  }, [stop]);

  useEffect(() => {
    // Determine if Web Speech API is supported by the browser.
    if (window.webkitSpeechRecognition) {
      setSupported(true);

      // Setup speech recognition.
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = continous;
      recognition.current.interimResults = interimResults;
      recognition.current.maxAlternatives = 5;
      recognition.current.lang = 'en-US';
      recognition.current.onstart = onRecognitionStart;
      recognition.current.onend = onRecognitionEnd;
      recognition.current.onresult = onRecognitionResult;
      recognition.current.onerror = onRecognitionError;

      if (import.meta.env.DEV) {
        (window as any).speechRecognition = recognition.current;
      }
      
      return () => {
        if (import.meta.env.DEV) {
          (window as any).speechRecognition = undefined;
        }
      }
    } else {
      setSupported(false)
    }
  }, []);

  return {
    supported,
    finalTranscript,
    interimTranscript,
    recording,
    start,
    stop,
    clear,
  }
}