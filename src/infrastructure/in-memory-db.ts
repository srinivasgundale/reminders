import { LifeLog } from "@/domain/log";
import { Reminder } from "@/domain/reminder";
import { LogRepository, ReminderRepository } from "@/domain/repository";

// Singleton storage for Client-Side Demo / Server-Side Mock
class InMemoryStorage {
    logs: LifeLog[] = [];
    reminders: Reminder[] = [];

    static instance = new InMemoryStorage();
}

export const logRepository: LogRepository = {
    async save(log: LifeLog) {
        const index = InMemoryStorage.instance.logs.findIndex(l => l.id === log.id);
        if (index >= 0) {
            InMemoryStorage.instance.logs[index] = log;
        } else {
            InMemoryStorage.instance.logs.push(log);
        }
    },
    async update(log: LifeLog) {
        const index = InMemoryStorage.instance.logs.findIndex(l => l.id === log.id);
        if (index >= 0) InMemoryStorage.instance.logs[index] = log;
    },
    async delete(id: string) {
        InMemoryStorage.instance.logs = InMemoryStorage.instance.logs.filter(l => l.id !== id);
    },
    async deleteMany(ids: string[]) {
        InMemoryStorage.instance.logs = InMemoryStorage.instance.logs.filter(l => !ids.includes(l.id));
    },
    async getAll() {
        return [...InMemoryStorage.instance.logs].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
    },
    async getRecent(limit: number) {
        return (await this.getAll()).slice(0, limit);
    }
};

export const reminderRepository: ReminderRepository = {
    async save(reminder: Reminder) {
        const index = InMemoryStorage.instance.reminders.findIndex(r => r.id === reminder.id);
        if (index >= 0) {
            InMemoryStorage.instance.reminders[index] = reminder;
        } else {
            InMemoryStorage.instance.reminders.push(reminder);
        }
    },
    async update(reminder: Reminder) {
        const index = InMemoryStorage.instance.reminders.findIndex(r => r.id === reminder.id);
        if (index >= 0) InMemoryStorage.instance.reminders[index] = reminder;
    },
    async delete(id: string) {
        InMemoryStorage.instance.reminders = InMemoryStorage.instance.reminders.filter(r => r.id !== id);
    },
    async deleteMany(ids: string[]) {
        InMemoryStorage.instance.reminders = InMemoryStorage.instance.reminders.filter(r => !ids.includes(r.id));
    },
    async getByStatus(status: string) {
        return InMemoryStorage.instance.reminders.filter(r => r.status === status)
            .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
    },
    async updateStatus(id: string, status: any) {
        const reminder = InMemoryStorage.instance.reminders.find(r => r.id === id);
        if (reminder) {
            reminder.status = status;
            reminder.updatedAt = new Date();
        }
    },
    async getAll() {
        return [...InMemoryStorage.instance.reminders].sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
    },
    async getPending() {
        return InMemoryStorage.instance.reminders
            .filter(r => r.status === 'pending')
            .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
    },
    async markComplete(id: string) {
        const reminder = InMemoryStorage.instance.reminders.find(r => r.id === id);
        if (reminder) {
            reminder.status = 'completed';
            reminder.updatedAt = new Date();
        }
    }
};
