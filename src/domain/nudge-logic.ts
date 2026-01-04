import { LifeLog } from "./log";
import { Reminder } from "./reminder";

export function predictNextNudge(log: LifeLog): { title: string, dueAt: Date } | null {
    const text = (log.title + " " + (log.notes || "")).toLowerCase();

    // Rule 1: Annual Renewals
    if (text.includes('renew') || text.includes('insurance') || text.includes('annual')) {
        const dueAt = new Date(log.occurredAt);
        dueAt.setFullYear(dueAt.getFullYear() + 1);
        // Nudge 1 week before
        dueAt.setDate(dueAt.getDate() - 7);

        return {
            title: `Renew: ${log.title}`,
            dueAt
        };
    }

    // Rule 2: 6-Month Maintenance
    if (text.includes('service') || text.includes('oil change') || text.includes('dentist')) {
        const dueAt = new Date(log.occurredAt);
        dueAt.setMonth(dueAt.getMonth() + 6);

        return {
            title: `Due: ${log.title}`,
            dueAt
        };
    }

    // Rule 3: 3-Month Maintainence
    if (text.includes('filter') || text.includes('clean')) {
        const dueAt = new Date(log.occurredAt);
        dueAt.setMonth(dueAt.getMonth() + 3);

        return {
            title: `Check: ${log.title}`,
            dueAt
        };
    }

    return null;
}
