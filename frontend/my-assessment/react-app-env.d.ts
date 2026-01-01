/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />



interface SpeechRecognition extends EventTarget {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (event: SpeechRecognitionEvent) => void;
        onerror: (event: SpeechRecognitionErrorEvent) => void;
        onend: () => void;
        onstart: () => void;
        onnomatch: (event: SpeechRecognitionEvent) => void;
        onsoundend: () => void;
        onsoundstart: () => void;
}

interface SpeechRecognitionEvent extends Event {

        results: SpeechRecognitionResultList;
        resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
        error: string;
        message: string;
}

interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
}