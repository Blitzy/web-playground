import { useCallback, useEffect, useRef, useState } from "react"
import { flattenFloat32Arrays } from "../../../utils/MiscUtils";

interface Microphone {
  supported: boolean;
  recording: boolean;
  record(): void;
  stop(): void;
}

export interface MicAudioData {
  buffer: Float32Array;
  duration: number;
}

interface Props {
  dataGapTarget?: number;
  sampleRate?: number;
  onData(data: MicAudioData): void;
}

export const useMicrophone = ({
  dataGapTarget = 500,
  sampleRate = 48000,
  onData
}: Props): Microphone => {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaStream = useRef<MediaStream>();
  const audioContext = useRef<AudioContext>();
  const pcmBuffer = useRef<Float32Array[]>([]);
  const pcmBufferDur = useRef<number>(0);
  
  const record = useCallback(() => {
    if (!mediaStream.current || !mediaStream.current.active) {
      return;
    }

    audioContext.current = new AudioContext({ sampleRate })
    console.log(`[microphone] audio context: `, audioContext.current);
    
    const recorder = audioContext.current.createScriptProcessor(4096, 1, 1);
    recorder.onaudioprocess = (event) => {
      // console.log(`onaudioprocess:`, event);
      const pcm = new Float32Array(event.inputBuffer.getChannelData(0));
      pcmBuffer.current.push(pcm);
      pcmBufferDur.current += event.inputBuffer.duration;

      if (pcmBufferDur.current >= dataGapTarget / 1000) {
        // Send out data to the consumer.
        onData({ 
          buffer: flattenFloat32Arrays(pcmBuffer.current),
          duration: pcmBufferDur.current
        });

        // Reset internal buffer array and duration.
        pcmBuffer.current = [];
        pcmBufferDur.current = 0;
      }
    }

    recorder.connect(audioContext.current.destination);

    const source = audioContext.current.createMediaStreamSource(mediaStream.current);
    source.connect(recorder);

    setRecording(true);
  }, [pcmBuffer]);

  const stop = useCallback(() => {
    if (audioContext.current && audioContext.current.state !== 'closed') {
      audioContext.current.close();
      setRecording(false);
    }
  }, [audioContext, setRecording]);

  useEffect(() => {
    // Get access to audio context.
    if (!!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia) {
      
      navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        mediaStream.current = stream;
        setSupported(true);
      })
      .catch((reason) => {
        console.error(`Error initializing audio-only MediaStream: `, reason);
        setSupported(false);
      });
    } else {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stop();

      if (mediaStream.current) {
        const tracks = mediaStream.current.getTracks();
        tracks.forEach(t => t.stop());
      }
    }
  }, []);

  return {
    supported,
    recording,
    record,
    stop,
  }
}