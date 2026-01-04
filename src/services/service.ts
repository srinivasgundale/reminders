import { createLifeLog, LogCategory } from "@/domain/log";
import { createReminder } from "@/domain/reminder";
import { LogRepository, ReminderRepository } from "@/domain/repository";
import { predictNextNudge } from "@/domain/nudge-logic";

export class AppService {
    constructor(
        private logRepo: LogRepository,
        private reminderRepo: ReminderRepository
    ) { }

    async logEvent(title: string, category: LogCategory, date: Date) {
        const log = createLifeLog(title, category, date);
        await this.logRepo.save(log);

        // Smart Logic Integration
        const suggestion = predictNextNudge(log);
        if (suggestion) {
            const reminder = createReminder(
                suggestion.title,
                suggestion.dueAt,
                log.id
            );
            await this.reminderRepo.save(reminder);
        }

        return log;
    }

    async createNudge(
        title: string,
        dueAt: Date,
        category: string = "general",
        remindBeforeValue: number = 0,
        remindBeforeUnit: string = "days"
    ) {
        // Logic to calculate initial notification time could go here
        const reminder = createReminder(title, dueAt, category, remindBeforeValue, remindBeforeUnit);
        await this.reminderRepo.save(reminder);
        return reminder;
    }

    async updateNudge(
        id: string,
        title: string,
        dueAt: Date,
        category: string,
        remindBeforeValue: number,
        remindBeforeUnit: string
    ) {
        // We need to fetch, update, save.
        // Since we don't have GetById, we will assume client passed valid data or use `save` with ID.
        // But `createReminder` generates new ID.
        // `Reminder` is an interface.
        // We can manually construct the object or add a `updateReminder` factory/helper?
        // Let's just create the object manually here for now, reusing existing ID.
        // Ideally we fetch it first to preserve `createdAt`.
        // I'll assume for now I can just strictly update what I have.
        // But wait, `createdAt` is needed.
        // I really need `getById` in Repo to do this properly.
        // AND user asked for "Edit Option".
        // Use `getAll` and find? (Inefficient but works for MVP).
        const all = await this.reminderRepo.getAll();
        const existing = all.find(r => r.id === id);
        if (!existing) throw new Error("Reminder not found");

        existing.title = title;
        existing.dueAt = dueAt;
        existing.category = category;
        existing.remindBeforeValue = remindBeforeValue;
        existing.remindBeforeUnit = remindBeforeUnit;

        await this.reminderRepo.update(existing);
    }

    async getDashboardData() {
        const [recentLogs, reminders] = await Promise.all([
            this.logRepo.getRecent(5),
            this.reminderRepo.getAll()
        ]);

        return {
            recentLogs,
            reminders
        };
    }

    async deleteLog(id: string) {
        await this.logRepo.delete(id);
    }

    async deleteLogs(ids: string[]) {
        await this.logRepo.deleteMany(ids);
    }

    async deleteReminder(id: string) {
        await this.reminderRepo.delete(id);
    }

    async deleteReminders(ids: string[]) {
        await this.reminderRepo.deleteMany(ids);
    }

    async updateReminderStatus(id: string, status: string) {
        await this.reminderRepo.updateStatus(id, status);
    }

    async togglePin(id: string) {
        // Efficiency hack: fetch all to find one (repo limitation), then update.
        // In real app, we need getById.
        const all = await this.reminderRepo.getAll();
        const existing = all.find(r => r.id === id);
        if (existing) {
            existing.isPinned = !existing.isPinned;
            await this.reminderRepo.update(existing);
        }
    }

    async cloneReminder(id: string) {
        const all = await this.reminderRepo.getAll();
        const existing = all.find(r => r.id === id);
        if (existing) {
            const clone = createReminder(
                existing.title + " (Copy)",
                new Date(existing.dueAt), // Same Time
                existing.category,
                existing.remindBeforeValue,
                existing.remindBeforeUnit
            );
            // Copy Pin status? User requirement: "Modify few fields". Usually clones aren't pinned by default but let's leave it unpinned.
            await this.reminderRepo.save(clone);
        }
    }

    async reorderReminders(ids: string[]) {
        await this.reminderRepo.reorder(ids);
    }
}
