/**
 * Speech Synthesis
 * Text-to-speech for Buddy's responses
 */

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Checks if speech synthesis is supported
 */
export function isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Gets available voices
 */
export function getVoices(): SpeechSynthesisVoice[] {
    if (!isSpeechSynthesisSupported()) return [];
    return speechSynthesis.getVoices();
}

/**
 * Speaks text aloud
 * Why: Allows hands-free interaction and accessibility
 */
export function speak(
    text: string,
    options?: {
        voice?: SpeechSynthesisVoice;
        rate?: number;
        pitch?: number;
        onEnd?: () => void;
    }
): void {
    if (!isSpeechSynthesisSupported()) return;

    // Cancel any ongoing speech
    stop();

    const utterance = new SpeechSynthesisUtterance(text);

    if (options?.voice) {
        utterance.voice = options.voice;
    } else {
        // Try to find a friendly-sounding voice
        const voices = getVoices();
        const preferred = voices.find((v) =>
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('karen') ||
            v.name.toLowerCase().includes('google') ||
            v.lang.startsWith('en')
        );
        if (preferred) utterance.voice = preferred;
    }

    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.1; // Slightly higher for friendliness

    if (options?.onEnd) {
        utterance.onend = options.onEnd;
    }

    currentUtterance = utterance;
    speechSynthesis.speak(utterance);
}

/**
 * Stops any ongoing speech
 */
export function stop(): void {
    if (isSpeechSynthesisSupported()) {
        speechSynthesis.cancel();
    }
    currentUtterance = null;
}

/**
 * Checks if currently speaking
 */
export function isSpeaking(): boolean {
    return isSpeechSynthesisSupported() && speechSynthesis.speaking;
}

/**
 * Pauses speech
 */
export function pause(): void {
    if (isSpeechSynthesisSupported()) {
        speechSynthesis.pause();
    }
}

/**
 * Resumes speech
 */
export function resume(): void {
    if (isSpeechSynthesisSupported()) {
        speechSynthesis.resume();
    }
}
