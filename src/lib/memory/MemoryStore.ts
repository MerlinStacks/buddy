/**
 * Memory Store using IndexedDB
 * Persists conversations, user facts, reminders, and preferences
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface BuddyDBSchema extends DBSchema {
    messages: {
        key: string;
        value: {
            id: string;
            role: 'user' | 'assistant' | 'system';
            content: string;
            timestamp: number;
        };
        indexes: { 'by-timestamp': number };
    };
    facts: {
        key: string;
        value: {
            id: string;
            fact: string;
            category: 'preference' | 'personal' | 'reminder' | 'other';
            createdAt: number;
            source?: string;
        };
    };
    reminders: {
        key: string;
        value: {
            id: string;
            message: string;
            triggerAt: number;
            completed: boolean;
            createdAt: number;
        };
        indexes: { 'by-trigger': number };
    };
    settings: {
        key: string;
        value: unknown;
    };
}

let dbPromise: Promise<IDBPDatabase<BuddyDBSchema>> | null = null;

/**
 * Opens or creates the IndexedDB database
 * Why: Lazy initialization for SSR compatibility
 */
function getDB(): Promise<IDBPDatabase<BuddyDBSchema>> {
    if (!dbPromise) {
        dbPromise = openDB<BuddyDBSchema>('buddy-memory', 1, {
            upgrade(db) {
                // Messages store
                const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
                messageStore.createIndex('by-timestamp', 'timestamp');

                // Facts store (learned user info)
                db.createObjectStore('facts', { keyPath: 'id' });

                // Reminders store
                const reminderStore = db.createObjectStore('reminders', { keyPath: 'id' });
                reminderStore.createIndex('by-trigger', 'triggerAt');

                // Settings store
                db.createObjectStore('settings');
            },
        });
    }
    return dbPromise;
}

// --- Message Operations ---

export async function saveMessage(
    role: 'user' | 'assistant',
    content: string
): Promise<string> {
    const db = await getDB();
    const id = crypto.randomUUID();
    await db.put('messages', {
        id,
        role,
        content,
        timestamp: Date.now(),
    });
    return id;
}

export async function getRecentMessages(limit = 50): Promise<BuddyDBSchema['messages']['value'][]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('messages', 'by-timestamp');
    return all.slice(-limit);
}

export async function clearMessages(): Promise<void> {
    const db = await getDB();
    await db.clear('messages');
}

// --- Fact Operations ---

export async function saveFact(
    fact: string,
    category: BuddyDBSchema['facts']['value']['category'] = 'other'
): Promise<string> {
    const db = await getDB();
    const id = crypto.randomUUID();
    await db.put('facts', {
        id,
        fact,
        category,
        createdAt: Date.now(),
    });
    return id;
}

export async function getAllFacts(): Promise<BuddyDBSchema['facts']['value'][]> {
    const db = await getDB();
    return db.getAll('facts');
}

export async function searchFacts(query: string): Promise<BuddyDBSchema['facts']['value'][]> {
    const facts = await getAllFacts();
    const lowerQuery = query.toLowerCase();
    return facts.filter((f) => f.fact.toLowerCase().includes(lowerQuery));
}

// --- Reminder Operations ---

export async function saveReminder(message: string, triggerAt: number): Promise<string> {
    const db = await getDB();
    const id = crypto.randomUUID();
    await db.put('reminders', {
        id,
        message,
        triggerAt,
        completed: false,
        createdAt: Date.now(),
    });
    return id;
}

export async function getPendingReminders(): Promise<BuddyDBSchema['reminders']['value'][]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('reminders', 'by-trigger');
    return all.filter((r) => !r.completed && r.triggerAt <= Date.now());
}

export async function completeReminder(id: string): Promise<void> {
    const db = await getDB();
    const reminder = await db.get('reminders', id);
    if (reminder) {
        reminder.completed = true;
        await db.put('reminders', reminder);
    }
}

// --- Settings Operations ---

export async function getSetting<T>(key: string): Promise<T | undefined> {
    const db = await getDB();
    return db.get('settings', key) as Promise<T | undefined>;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
    const db = await getDB();
    await db.put('settings', value, key);
}
