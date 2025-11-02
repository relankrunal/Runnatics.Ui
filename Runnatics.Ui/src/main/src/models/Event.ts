import { EventStatus } from "./EventStatus";

export interface Event {
    id: number;
    organizationId: number;
    name: string;
    slug: string;
    description?: string;
    eventDate: string; // ISO datetime
    timeZone: string;
    venueName?: string;
    venueAddress?: string;
    venueLatitude?: number;
    venueLongitude?: number;
    status: EventStatus;
    maxParticipants?: number;
    registrationDeadline?: string; // ISO datetime
    settings?: string; // JSON string
    createdAt: string;
    createdBy?: number;
    updatedAt?: string;
    updatedBy?: number;
    isActive: boolean;
    isDeleted: boolean;
  }