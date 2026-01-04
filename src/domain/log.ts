import { DomainEntity } from "./base";

export type LogCategory = 'maintenance' | 'health' | 'finance' | 'social' | 'misc';

export interface LifeLog extends DomainEntity {
    title: string;
    category: LogCategory;
    notes?: string;
    occurredAt: Date; // The actual date the event happened
}

// Factory for creating new logs
export function createLifeLog(
    title: string,
    category: LogCategory,
    occurredAt: Date = new Date(),
    notes?: string
): LifeLog {
    return {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        title,
        category,
        occurredAt,
        notes,
    };
}
