export type EntityID = string;

export interface DomainEntity {
  id: EntityID;
  createdAt: Date;
  updatedAt: Date;
}
