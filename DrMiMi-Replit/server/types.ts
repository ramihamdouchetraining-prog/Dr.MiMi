// Type definitions for MediMimi backend

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    adminUserId?: string;
    adminUsername?: string;
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      claims?: {
        sub: string;
        email?: string;
        [key: string]: any;
      };
      access_token?: string;
      refresh_token?: string;
      expires_at?: number;
    }
  }
}

export {};
