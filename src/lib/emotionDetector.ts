/**
 * Emotion Detector
 * Analyzes text content to determine appropriate Buddy mood
 * Uses keyword/phrase matching for real-time emotion detection
 */

import type { BuddyMood } from './store';

interface EmotionPattern {
    mood: BuddyMood;
    keywords: string[];
    phrases: string[];
    weight: number;
}

/**
 * Emotion patterns ordered by specificity.
 * Higher weight = stronger signal for that emotion.
 */
const EMOTION_PATTERNS: EmotionPattern[] = [
    {
        mood: 'excited',
        keywords: ['wow', 'amazing', 'incredible', 'fantastic', 'awesome', 'brilliant', 'excellent', 'wonderful'],
        phrases: ["that's exciting", "i can't wait", 'this is great', 'how exciting'],
        weight: 3,
    },
    {
        mood: 'sad',
        keywords: ['sorry', 'unfortunately', 'sad', 'loss', 'difficult', 'tough', 'hard', 'condolences', 'miss'],
        phrases: ["i'm sorry to hear", 'that must be hard', 'my condolences', "i understand how you feel"],
        weight: 3,
    },
    {
        mood: 'surprised',
        keywords: ['whoa', 'unexpected', 'really', 'seriously', 'no way', 'unbelievable'],
        phrases: ["i didn't expect", "that's surprising", 'wait what', 'are you serious'],
        weight: 2,
    },
    {
        mood: 'happy',
        keywords: ['great', 'good', 'nice', 'lovely', 'glad', 'happy', 'pleased', 'enjoy', 'love', 'congratulations', 'yay'],
        phrases: ['well done', "that's great", 'happy to help', 'glad to hear'],
        weight: 2,
    },
    {
        mood: 'confused',
        keywords: ['hmm', 'unclear', 'strange', 'weird', 'odd', 'confusing', 'puzzling'],
        phrases: ["i'm not sure", "that's strange", 'let me think', "i don't understand"],
        weight: 2,
    },
    {
        mood: 'embarrassed',
        keywords: ['oops', 'mistake', 'wrong', 'error', 'apologies', 'meant'],
        phrases: ['my mistake', 'i was wrong', 'let me correct', 'i apologize'],
        weight: 2,
    },
    {
        mood: 'thinking',
        keywords: ['consider', 'analyze', 'think', 'perhaps', 'maybe', 'might', 'possibly', 'interesting'],
        phrases: ['let me think', 'good question', 'that depends', 'considering'],
        weight: 1,
    },
];

/**
 * Detects the most appropriate mood based on text content.
 * Scans for keywords and phrases, returns highest-weighted match.
 * 
 * @param text - The text content to analyze
 * @returns The detected mood, or null if no strong signal found
 */
export function detectEmotion(text: string): BuddyMood | null {
    const lowerText = text.toLowerCase();

    let bestMatch: { mood: BuddyMood; score: number } | null = null;

    for (const pattern of EMOTION_PATTERNS) {
        let score = 0;

        // Check phrases first (more specific)
        for (const phrase of pattern.phrases) {
            if (lowerText.includes(phrase)) {
                score += pattern.weight * 2;
            }
        }

        // Check keywords
        for (const keyword of pattern.keywords) {
            // Word boundary check to avoid partial matches
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(lowerText)) {
                score += pattern.weight;
            }
        }

        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { mood: pattern.mood, score };
        }
    }

    return bestMatch?.mood ?? null;
}

/**
 * Analyzes streaming text and returns mood updates.
 * Only triggers mood change when confidence passes threshold.
 * 
 * @param fullText - Accumulated response text so far
 * @param currentMood - The current Buddy mood
 * @returns New mood if detected, otherwise current mood
 */
export function analyzeStreamingEmotion(
    fullText: string,
    currentMood: BuddyMood
): BuddyMood {
    // Don't interrupt talking animation for first few words
    if (fullText.length < 50) {
        return currentMood;
    }

    const detected = detectEmotion(fullText);

    // Only switch if we have a strong signal
    if (detected && detected !== 'thinking') {
        return detected;
    }

    return currentMood;
}
