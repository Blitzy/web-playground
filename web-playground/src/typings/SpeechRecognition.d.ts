

declare global {
  interface SpeechGrammar {
    src: string;
    weight?: number;
  }

  interface SpeechGrammarsList {
    new(): SpeechGrammarsList;
    
    readonly length: number;

    item(index: number): SpeechGrammar;
    [index: number]: SpeechGrammar;

    addFromURI(src: string, weight?: number): void;
    addFromString(s: string, weight?: number): void;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;

    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognition extends EventTarget {
    new(): SpeechRecognition;

    grammars: SpeechGrammarsList;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;

    abort(): void;
    start(): void;
    stop(): void;
    
    /**
     * Fired when the user agent has started to capture audio.
     */
    onaudiostart(): void;
    
    /**
     * Fired when the user agent has finished capturing audio.
     */
    onaudioend(): void;

    /**
     * Fired when the speech recognition service has disconnected.
     */
    onend(): void;

    /**
     * Fired when a speech recognition error occurs.
     */
    onerror(event: SpeechRecognitionErrorEvent): void;

    /**
     * Fired when the speech recognition service returns a final result with no significant recognition. 
     * This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
     */
    onnomatch(event: SpeechRecognitionEvent): void;

    /**
     * Fired when the speech recognition service returns a result — a word or 
     * phrase has been positively recognized and this has been communicated back to the app.
     */
    onresult(event: SpeechRecognitionEvent): void;

    /**
     * Fired when any sound — recognisable speech or not — has been detected. 
     */
    onsoundstart(event: Event): void;

    /**
     * Fired when any sound — recognisable speech or not — has stopped being detected. 
     */
    onsoundend(event: Event): void;

    /**
     * Fired when sound that is recognized by the speech recognition service as speech has been detected.
     */
    onspeechstart(event: Event): void;

    /**
     * Fired when speech recognized by the speech recognition service has stopped being detected.
     */
    onspeechend(event: Event): void;

    /**
     * Fired when the speech recognition service has begun listening to incoming audio with 
     * intent to recognize grammars associated with the current SpeechRecognition.
     */
    onstart(event: Event): void;
  }

  interface Window {
      webkitSpeechRecognition?: SpeechRecognition;
  }
}

export{}