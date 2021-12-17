import { useCallback, useEffect, useRef, useState } from "react";

interface RevAiConnectedMessage {
  id: string;
  type: 'connected';
}

interface RevAiHypothesisMessage {
  type: 'partial' | 'final';
  ts: number;
  end_ts: number;
  elements: {
    type: string;
    value: string;
    ts?: number;
    end_ts?: number;
    confident?: number;
  }[];
}

export type RawAudioLayout = 'interleaved' | 'non-interleaved';
export type RawAudioFormat =  'S8' | 'U8' | 'S16LE' | 'S16BE' | 'U16LE' | 'U16BE' | 'S24_32LE' |'S24_32BE' | 'U24_32LE' | 'U24_32BE' | 
'S32LE' | 'S32BE' |'U32LE' | 'U32BE' | 'S24LE' | 'S24BE' | 'U24LE' | 'U24BE' | 'S20LE' | 'S20BE' | 'U20LE' | 'U20BE' | 'S18LE' | 'S18BE' | 
'U18LE' | 'U18BE' | 'F32LE' | 'F32BE' | 'F64LE' | 'F64BE'

interface RevAiConnectionParams {
  accessToken: string;
  layout?: RawAudioLayout;
  format?: RawAudioFormat;
  channels?: number;
  sampleRate?: number;
}

function isRevAiConnectedMessage(data: any): data is RevAiConnectedMessage {
  return data.type === 'connected';
}

function isRevAiHypothesisMessage(data: any): data is RevAiHypothesisMessage {
  return data.type === 'partial' || data.type === 'final';
}

interface RevAi {
  connected: boolean;
  finalTranscript: string;
  interimTranscript: string;
  connect(params: RevAiConnectionParams): void;
  endStream(): void;
  send(pcm: Float32Array): void;
  clear(): void;
}

interface RevAiProps {
  maxDuration?: number;
}

export const useRevAi = ({
  maxDuration = 7,
}: RevAiProps): RevAi =>  {
  const socket = useRef<WebSocket>();
  const [connected, setConnected] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const timeoutHandler = useRef<number>();

  const onSocketOpen = useCallback((event: Event) => {
    console.log(`[rev.ai] socket opened: `, event);
  }, []);

  const onSocketClose = useCallback((event: CloseEvent) => {
    console.log(`[rev.ai] socket closed [code: ${event.code} | wasClean: ${event.wasClean} | reason: ${event.reason}] `);
    setConnected(false);
    socket.current = undefined;
  }, []);
  
  const onSocketMessage = useCallback((event: MessageEvent<string>) => {
    const data = JSON.parse(event.data);
    console.log(`[rev.ai] socket message data:`, data);

    if (isRevAiConnectedMessage(data)) {
      setConnected(true);

      // Setup timeout using the provided max duration.
      timeoutHandler.current = window.setTimeout(() => {
        console.log(`[rev.ai] max duration met, will now end stream.`);
        endStream();
      }, maxDuration * 1000);

    } else if (isRevAiHypothesisMessage(data)) {
      
      if (data.type === 'partial') {
        // Partial hypothesis.
        const value = data.elements.reduce<string>((acc, el) => { return acc + el.value + ' ' }, '');
        setInterimTranscript(value);
      } else {
        // Final hypothesis.
        const value = data.elements.reduce<string>((acc, el) => { return acc + el.value }, '');
        setFinalTranscript((prev) => { return prev + value + ' '});
        setInterimTranscript('');
      }
    } else {
      console.error(`[rev.ai] socket message not implemented.`, data);
    }
  }, []);

  const onSocketError = useCallback((event: Event) => {
    console.error(`[rev.ai] socket error: `, event);
  }, []);

  const connect = useCallback((params: RevAiConnectionParams) => {
    const {
      accessToken,
      sampleRate = 48000,
      layout = 'non-interleaved',
      format = 'F32LE',
      channels = 1,
    } = params;

    const endpoint = new URL('wss://api.rev.ai/speechtotext/v1/stream');
    endpoint.searchParams.append('access_token', accessToken);
    endpoint.searchParams.append('content_type', `audio/x-raw;layout=${layout};rate=${sampleRate};format=${format};channels=${channels}`);

    socket.current = new WebSocket(endpoint.toString());
    
    socket.current.onopen = onSocketOpen;
    socket.current.onclose = onSocketClose;
    socket.current.onmessage = onSocketMessage;
    socket.current.onerror = onSocketError;
  }, [socket]);

  const endStream = useCallback(() => {
    if (timeoutHandler.current) {
      window.clearTimeout(timeoutHandler.current);
      timeoutHandler.current = undefined;
    }

    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      console.log(`[rev.ai] socket send EOS`);
      socket.current.send('EOS');
    }
  }, [socket]);

  const forceDisconnect = useCallback(() => {
    console.log(`[rev.ai] force disconnect`);
    if (timeoutHandler.current) {
      window.clearTimeout(timeoutHandler.current);
      timeoutHandler.current = undefined;
    }

    if (socket.current) {
      socket.current.close();
      socket.current = undefined;
    }
  }, [socket, timeoutHandler]);

  const send = useCallback((pcm: Float32Array) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      console.log(`[rev.ai] socket send pcm`);
      socket.current.send(pcm);
    }
  }, [socket, timeoutHandler]);

  const clear = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', forceDisconnect);
    window.addEventListener('unload', forceDisconnect);

    return () => {
      forceDisconnect();
    }
  }, []);

  return {
    connected,
    finalTranscript,
    interimTranscript,
    connect,
    endStream,
    send,
    clear,
  }
}