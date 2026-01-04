import { LogCategory, LifeLog } from "@/domain/log";
import { Reminder, ReminderStatus } from "@/domain/reminder";
import { LogRepository, ReminderRepository } from "@/domain/repository";
import { prisma } from "@/lib/prisma";

export const prismaLogRepository: LogRepository = {
    async save(log: LifeLog) {
        await prisma.lifeLog.upsert({
            where: { id: log.id },
            update: {
                title: log.title,
                category: log.category,
                notes: log.notes,
                occurredAt: log.occurredAt,
                updatedAt: new Date()
            },
            create: {
                id: log.id,
                title: log.title,
                category: log.category,
                notes: log.notes,
                occurredAt: log.occurredAt
            }
        });
    },

    async update(log: LifeLog) {
        await prisma.lifeLog.update({
            where: { id: log.id },
            data: {
                title: log.title,
                category: log.category,
                notes: log.notes,
                occurredAt: log.occurredAt,
                updatedAt: new Date()
            }
        });
    },

    async delete(id: string) {
        await prisma.lifeLog.delete({ where: { id } });
    },

    async deleteMany(ids: string[]) {
        await prisma.lifeLog.deleteMany({
            where: { id: { in: ids } }
        });
    },

    async getAll() {
        const logs = await prisma.lifeLog.findMany({
            orderBy: { occurredAt: 'desc' }
        });
        return logs.map(mapToLifeLog);
    },

    async getRecent(limit: number) {
        const logs = await prisma.lifeLog.findMany({
            orderBy: { occurredAt: 'desc' },
            take: limit
        });
        return logs.map(mapToLifeLog);
    }
};

export const prismaReminderRepository: ReminderRepository = {
    async save(reminder: Reminder) {
        await prisma.reminder.upsert({
            where: { id: reminder.id },
            update: {
                title: reminder.title,
                category: reminder.category,
                dueAt: reminder.dueAt,
                remindBeforeValue: reminder.remindBeforeValue,
                remindBeforeUnit: reminder.remindBeforeUnit,
                status: reminder.status,
                isPinned: reminder.isPinned,
                displayOrder: reminder.displayOrder,
                linkedLogId: reminder.linkedLogId,
                recurrenceRuleId: reminder.recurrenceRuleId,
                updatedAt: new Date()
            },
            create: {
                id: reminder.id,
                createdAt: reminder.createdAt,
                updatedAt: reminder.updatedAt,
                title: reminder.title,
                category: reminder.category,
                dueAt: reminder.dueAt,
                remindBeforeValue: reminder.remindBeforeValue,
                remindBeforeUnit: reminder.remindBeforeUnit,
                status: reminder.status,
                isPinned: reminder.isPinned,
                displayOrder: reminder.displayOrder,
                linkedLogId: reminder.linkedLogId,
                recurrenceRuleId: reminder.recurrenceRuleId
            }
        });
    },

    async update(reminder: Reminder) {
        await prisma.reminder.update({
            where: { id: reminder.id },
            data: {
                title: reminder.title,
                category: reminder.category,
                dueAt: reminder.dueAt,
                remindBeforeValue: reminder.remindBeforeValue,
                remindBeforeUnit: reminder.remindBeforeUnit,
                status: reminder.status,
                isPinned: reminder.isPinned,
                displayOrder: reminder.displayOrder,
                updatedAt: new Date()
            }
        });
    },

    async delete(id: string) {
        await prisma.reminder.delete({ where: { id } });
    },

    async deleteMany(ids: string[]) {
        await prisma.reminder.deleteMany({
            where: { id: { in: ids } }
        });
    },

    async getByStatus(status: string) {
        const reminders = await prisma.reminder.findMany({
            where: { status },
            orderBy: [
                { displayOrder: 'asc' },
                { isPinned: 'desc' },
                { dueAt: 'asc' }
            ]
        });
        return reminders.map(mapToReminder);
    },

    async updateStatus(id: string, status: string) {
        await prisma.reminder.update({
            where: { id },
            data: {
                status,
                updatedAt: new Date()
            }
        });
    },

    async getAll() {
        const reminders = await prisma.reminder.findMany({
            orderBy: [
                { displayOrder: 'asc' },
                { isPinned: 'desc' },
                { dueAt: 'asc' }
            ]
        });
        return reminders.map(mapToReminder);
    },

    async getPending() {
        const reminders = await prisma.reminder.findMany({
            where: { status: 'pending' },
            orderBy: [
                { displayOrder: 'asc' },
                { isPinned: 'desc' },
                { dueAt: 'asc' }
            ]
        });
        return reminders.map(mapToReminder);
    },

    async markComplete(id: string) {
        await prisma.reminder.update({
            where: { id },
            data: {
                status: 'completed',
                updatedAt: new Date()
            }
        });
    },

    async reorder(ids: string[]) {
        // Use a transaction for multiple updates
        await prisma.$transaction(
            ids.map((id, index) =>
                prisma.reminder.update({
                    where: { id },
                    data: { displayOrder: index }
                })
            )
        );
    }
};

// Mappers to ensure Domain Purity
// Use 'any' or explicit generated types if importing from @prisma/client is tricky in pure files, 
// but here we are in infrastructure/ which is allowed to know about DB.
function mapToLifeLog(dbLog: any): LifeLog {
    return {
        id: dbLog.id,
        createdAt: dbLog.createdAt,
        updatedAt: dbLog.updatedAt,
        title: dbLog.title,
        category: dbLog.category as LogCategory,
        notes: dbLog.notes || undefined,
        occurredAt: dbLog.occurredAt
    };
}

function mapToReminder(dbRem: any): Reminder {
    return {
        id: dbRem.id,
        createdAt: dbRem.createdAt,
        updatedAt: dbRem.updatedAt,
        title: dbRem.title,
        category: dbRem.category,
        dueAt: dbRem.dueAt,
        remindBeforeValue: dbRem.remindBeforeValue,
        remindBeforeUnit: dbRem.remindBeforeUnit,
        status: dbRem.status as ReminderStatus,
        isPinned: dbRem.isPinned,
        displayOrder: dbRem.displayOrder || 0,
        linkedLogId: dbRem.linkedLogId || undefined,
        recurrenceRuleId: dbRem.recurrenceRuleId || undefined
    };
}
