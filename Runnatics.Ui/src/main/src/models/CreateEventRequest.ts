import { EventSettings } from "./EventSettings";
import { EventStatus } from "./EventStatus";

export interface CreateEventRequest {
    organizationId: number;
    name: string;
    slug: string;
    description?: string;
    eventDate: string;
    timeZone: string;
    venueName?: string;
    venueAddress?: string;
    venueLatitude?: number;
    venueLongitude?: number;
    status: EventStatus;
    maxParticipants?: number;
    registrationDeadline?: string;
    settings?: EventSettings;
    organizers: string[]; // Array of organizer names
  }