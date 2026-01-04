import { DomainEntity } from "./base";

export type AssetType = 'Domain' | 'Subscription' | 'License' | 'Warranty' | 'Certificate' | 'Other';

export interface DigitalAsset extends DomainEntity {
    title: string;
    type: AssetType;
    category: string;
    identifier?: string;
    metadata?: string;
    expiresAt?: Date;
    remindAt?: Date;
    status: 'active' | 'expired' | 'cancelled';
    displayOrder: number;
}

export function createAsset(
    title: string,
    type: AssetType,
    category: string = 'Personal',
    identifier?: string,
    metadata?: string,
    expiresAt?: Date,
    remindAt?: Date
): DigitalAsset {
    return {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        title,
        type,
        category,
        identifier,
        metadata,
        expiresAt,
        remindAt,
        status: 'active',
        displayOrder: 0
    };
}
