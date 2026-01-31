/**
 * Speech Recognition
 * Web Speech API wrapper for speech-to-text
 */

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}

type SpeechCallback = (transcript: string, isFinal: boolean) => void;

let recognition: SpeechRecognition | null = null;

/**
 * Checks if speech recognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

/**
 * Starts speech recognition
 * Why: Hands-free interaction with Buddy
 */
export function startListening(
    onResult: SpeechCallback,
    onEnd: () => void,
    onError: (error: string) => void
): void {
    if (!isSpeechRecognitionSupported()) {
        onError('Speech recognition not supported');
        return;
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
        onError('Speech recognition not available');
        return;
    }

    recognition = new SpeechRecognitionCtor();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;
        onResult(transcript, isFinal);
    };

    recognition.onend = () => {
        recognition = null;
        onEnd();
    };

    recognition.onerror = (event) => {
        onError(event.error);
        recognition = null;
    };

    recognition.start();
}

/**
 * Stops speech recognition
 */
export function stopListening(): void {
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
}

/**
 * Checks if currently listening
 */
export function isListening(): boolean {
    return recognition !== null;
}

