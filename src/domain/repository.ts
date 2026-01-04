import { LifeLog } from "./log";
import { Reminder } from "./reminder";

export interface LogRepository {
    save(log: LifeLog): Promise<void>;
    update(log: LifeLog): Promise<void>;
    delete(id: string): Promise<void>;
    deleteMany(ids: string[]): Promise<void>;
    getAll(): Promise<LifeLog[]>;
    getRecent(limit: number): Promise<LifeLog[]>;
}

export interface ReminderRepository {
    save(reminder: Reminder): Promise<void>;
    update(reminder: Reminder): Promise<void>;
    delete(id: string): Promise<void>;
    deleteMany(ids: string[]): Promise<void>;
    getByStatus(status: string): Promise<Reminder[]>;
    getPending(): Promise<Reminder[]>;
    updateStatus(id: string, status: string): Promise<void>;
    markComplete(id: string): Promise<void>;
    getAll(): Promise<Reminder[]>;
    reorder(ids: string[]): Promise<void>;
}
