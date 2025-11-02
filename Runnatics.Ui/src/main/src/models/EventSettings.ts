export interface EventSettings {
    allowWaitlist?: boolean;
    autoConfirmRegistrations?: boolean;
    requireApproval?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    [key: string]: any; // Allow additional settings
  }