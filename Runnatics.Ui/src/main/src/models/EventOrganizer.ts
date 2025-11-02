export interface EventOrganizer {
    id: number;
    eventId: number;
    name: string;
    createdBy: number;
    createdAt: string;
    updatedBy?: number;
    updatedAt?: string;
    isActive: boolean;
    isDeleted: boolean;
}
  