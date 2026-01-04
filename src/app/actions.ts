'use server'

import { prismaLogRepository, prismaReminderRepository, prismaAssetRepository } from "@/infrastructure/prisma-db";
import { AppService } from "@/services/service";
import { LogCategory } from "@/domain/log";
import { AssetType } from "@/domain/asset";

// Instantiate Service with Prisma Repositories
const service = new AppService(prismaLogRepository, prismaReminderRepository, prismaAssetRepository);

export async function getDashboardData() {
    return service.getDashboardData();
}

export async function submitLog(title: string, category: LogCategory, dateStr: string) {
    // Parsing date from string input
    const date = new Date(dateStr);
    await service.logEvent(title, category, date);
    // Return updated data
    return service.getDashboardData();
}

export async function submitReminder(
    title: string,
    dueAt: string,
    category: string,
    remindBeforeValue: number,
    remindBeforeUnit: string
) {
    const date = new Date(dueAt);
    await service.createNudge(title, date, category, remindBeforeValue, remindBeforeUnit);
    return service.getDashboardData();
}

export async function updateNudgeAction(
    id: string,
    title: string,
    dueAt: string,
    category: string,
    remindBeforeValue: number,
    remindBeforeUnit: string
) {
    const date = new Date(dueAt);
    await service.updateNudge(id, title, date, category, remindBeforeValue, remindBeforeUnit);
    return service.getDashboardData();
}

export async function deleteLogAction(id: string) {
    await service.deleteLog(id);
    return service.getDashboardData();
}

export async function deleteMultipleLogsAction(ids: string[]) {
    await service.deleteLogs(ids);
    return service.getDashboardData();
}

export async function addTestReminderAction() {
    await service.createNudge("Test Reminder: Renew Insurance", new Date(Date.now() + 86400000)); // +1 Day
    return service.getDashboardData();
}

export async function deleteReminderAction(id: string) {
    await service.deleteReminder(id);
    return service.getDashboardData();
}

export async function deleteMultipleRemindersAction(ids: string[]) {
    await service.deleteReminders(ids);
    return service.getDashboardData();
}

export async function updateReminderStatusAction(id: string, status: string) {
    await service.updateReminderStatus(id, status);
    return service.getDashboardData();
}

export async function togglePinAction(id: string) {
    await service.togglePin(id);
    return service.getDashboardData();
}

export async function cloneReminderAction(id: string) {
    await service.cloneReminder(id);
    return service.getDashboardData();
}

export async function reorderRemindersAction(ids: string[]) {
    await service.reorderReminders(ids);
    return service.getDashboardData();
}

// Asset Actions
export async function getAssetsAction() {
    return service.getAllAssets();
}

export async function submitAssetAction(
    title: string,
    type: AssetType,
    category: string,
    identifier?: string,
    metadata?: string,
    expiresAt?: string,
    remindAt?: string
) {
    await service.createAsset(
        title,
        type,
        category,
        identifier,
        metadata,
        expiresAt ? new Date(expiresAt) : undefined,
        remindAt ? new Date(remindAt) : undefined
    );
    return service.getAllAssets();
}

export async function updateAssetAction(
    id: string,
    title: string,
    type: AssetType,
    category: string,
    identifier?: string,
    metadata?: string,
    expiresAt?: string,
    remindAt?: string
) {
    await service.updateAsset(
        id,
        title,
        type,
        category,
        identifier,
        metadata,
        expiresAt ? new Date(expiresAt) : undefined,
        remindAt ? new Date(remindAt) : undefined
    );
    return service.getAllAssets();
}

export async function deleteAssetAction(id: string) {
    await service.deleteAsset(id);
    return service.getAllAssets();
}

export async function reorderAssetsAction(ids: string[]) {
    await service.reorderAssets(ids);
    return service.getAllAssets();
}
