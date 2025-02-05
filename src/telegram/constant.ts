export const commands = [
  '/start',
  '/help',
  '/events',
  '/jobs',
  '/earnings',
  '/faq',
  '/brand',
];

// Constants for session management
export const MAX_SESSIONS = 100;
export const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

// Interface for session data
export interface SessionData {
  waitingForTicket: boolean;
  pendingTicket?: string;
  createdAt: number;
}
