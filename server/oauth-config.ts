import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

// OAuth Configuration
export const configureOAuth = () => {
  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let [user] = await db.select().from(users)
          .where(eq(users.email, profile.emails?.[0]?.value || ''));
        
        if (!user) {
          // Create new user
          const [newUser] = await db.insert(users).values({
            email: profile.emails?.[0]?.value || '',
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            profileImageUrl: profile.photos?.[0]?.value,
            provider: 'google',
            providerId: profile.id,
            role: 'viewer',
            yearOfStudy: '1',
            specialty: 'general',
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning();
          user = newUser;
        } else {
          // Update existing user
          const [updatedUser] = await db.update(users)
            .set({
              provider: 'google',
              providerId: profile.id,
              profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl,
              updatedAt: new Date()
            })
            .where(eq(users.id, user.id))
            .returning();
          user = updatedUser;
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }));
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ['id', 'emails', 'name', 'photos']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let [user] = await db.select().from(users)
          .where(eq(users.email, profile.emails?.[0]?.value || ''));
        
        if (!user) {
          // Create new user
          const [newUser] = await db.insert(users).values({
            email: profile.emails?.[0]?.value || '',
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            profileImageUrl: profile.photos?.[0]?.value,
            provider: 'facebook',
            providerId: profile.id,
            role: 'viewer',
            yearOfStudy: '1',
            specialty: 'general',
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning();
          user = newUser;
        } else {
          // Update existing user
          const [updatedUser] = await db.update(users)
            .set({
              provider: 'facebook',
              providerId: profile.id,
              profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl,
              updatedAt: new Date()
            })
            .where(eq(users.id, user.id))
            .returning();
          user = updatedUser;
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }));
  }

  // Microsoft OAuth Strategy (for Outlook)
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    passport.use(new MicrosoftStrategy({
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: "/api/auth/microsoft/callback",
      scope: ['user.read', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let [user] = await db.select().from(users)
          .where(eq(users.email, profile.emails?.[0]?.value || ''));
        
        if (!user) {
          // Create new user
          const [newUser] = await db.insert(users).values({
            email: profile.emails?.[0]?.value || '',
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            profileImageUrl: profile.photos?.[0]?.value,
            provider: 'microsoft',
            providerId: profile.id,
            role: 'viewer',
            yearOfStudy: '1',
            specialty: 'general',
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning();
          user = newUser;
        } else {
          // Update existing user
          const [updatedUser] = await db.update(users)
            .set({
              provider: 'microsoft',
              providerId: profile.id,
              profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl,
              updatedAt: new Date()
            })
            .where(eq(users.id, user.id))
            .returning();
          user = updatedUser;
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }));
  }
};

// Helper to check if OAuth is configured
export const isOAuthConfigured = () => {
  const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const facebookConfigured = !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
  const microsoftConfigured = !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
  
  return {
    google: googleConfigured,
    facebook: facebookConfigured,
    microsoft: microsoftConfigured,
    any: googleConfigured || facebookConfigured || microsoftConfigured
  };
};