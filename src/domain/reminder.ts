import { DomainEntity, EntityID } from "./base";

export type ReminderStatus = 'pending' | 'completed' | 'snoozed' | 'missed';

export interface Reminder extends DomainEntity {
    title: string;
    category: string;
    dueAt: Date;
    remindBeforeValue: number;
    remindBeforeUnit: string;
    status: ReminderStatus;
    isPinned: boolean;
    displayOrder: number;
    linkedLogId?: EntityID; // If this reminder was spawned from a specific log
    recurrenceRuleId?: EntityID; // If part of a repeating series
}

export function createReminder(
    title: string,
    dueAt: Date,
    category: string = "general",
    remindBeforeValue: number = 0,
    remindBeforeUnit: string = "days",
    linkedLogId?: EntityID
): Reminder {
    return {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        title,
        category,
        dueAt,
        remindBeforeValue,
        remindBeforeUnit,
        status: 'pending',
        isPinned: false,
        displayOrder: 0,
        linkedLogId
    };
}

export function markReminderComplete(reminder: Reminder): Reminder {
    return {
        ...reminder,
        status: 'completed',
        updatedAt: new Date(),
    };
}
