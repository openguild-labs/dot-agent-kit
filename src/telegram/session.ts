import { MAX_SESSIONS, SESSION_TIMEOUT, SessionData } from './constant';

// Session manager class
export class SessionManager {
  private sessions: Map<number, SessionData> = new Map();
  private timeouts: Map<number, NodeJS.Timeout> = new Map();

  constructor() {
    // Periodically clean expired sessions
    setInterval(() => this.cleanExpiredSessions(), 60000); // Check every minute
  }

  set(userId: number, data: Omit<SessionData, 'createdAt'>): boolean {
    // Check if we're at capacity and this is a new session
    if (!this.sessions.has(userId) && this.sessions.size >= MAX_SESSIONS) {
      return false;
    }

    // Clear existing timeout if any
    this.clearTimeout(userId);

    // Set new session data
    this.sessions.set(userId, {
      ...data,
      createdAt: Date.now(),
    });

    // Set timeout for this session
    const timeout = setTimeout(() => {
      this.delete(userId);
    }, SESSION_TIMEOUT);

    this.timeouts.set(userId, timeout);
    return true;
  }

  get(userId: number): SessionData | undefined {
    const session = this.sessions.get(userId);
    if (session && Date.now() - session.createdAt > SESSION_TIMEOUT) {
      this.delete(userId);
      return undefined;
    }
    return session;
  }

  delete(userId: number): void {
    this.sessions.delete(userId);
    this.clearTimeout(userId);
  }

  private clearTimeout(userId: number): void {
    const timeout = this.timeouts.get(userId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(userId);
    }
  }

  private cleanExpiredSessions(): void {
    const now = Date.now();
    for (const [userId, session] of this.sessions.entries()) {
      if (now - session.createdAt > SESSION_TIMEOUT) {
        this.delete(userId);
      }
    }
  }

  getActiveSessionsCount(): number {
    return this.sessions.size;
  }
}
