// Authentication routes for user login/register
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Extend Express Session type to include userId and userRole
declare module 'express-session' {
  interface SessionData {
    userId: string;
    userRole: string;
  }
}

const router = Router();

// POST /api/auth/register - Register new user with complete profile
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      country,
      wilaya,
      university,
      phone,
      userStatus,
      yearOfStudy, 
      locale 
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !country || !university || !phone || !userStatus) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    // Validate Algeria-specific fields
    if (country === 'DZ' && !wilaya) {
      return res.status(400).json({
        success: false,
        message: 'Wilaya is required for Algerian users'
      });
    }

    // Validate year of study for students
    if (userStatus === 'student' && !yearOfStudy) {
      return res.status(400).json({
        success: false,
        message: 'Year of study is required for students'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password strength (server-side enforcement)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with complete profile
    const newUser = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        country,
        wilaya: country === 'DZ' ? wilaya : null,
        university,
        phone,
        userStatus,
        yearOfStudy: userStatus === 'student' ? yearOfStudy : null,
        locale: locale || 'fr',
        role: 'viewer', // Default role for new users
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser[0];

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (foundUsers.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = foundUsers[0];

    // Check if user is blacklisted
    if (user.isBlacklisted) {
      return res.status(403).json({
        success: false,
        message: 'Account has been suspended. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Regenerate session to prevent session fixation attacks
    if (req.session) {
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.status(500).json({
            success: false,
            message: 'Error during login'
          });
        }

        // Store user in new session
        req.session.userId = user.id;
        req.session.userRole = user.role || 'viewer';

        // Don't send password back
        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          user: userWithoutPassword
        });
      });
    } else {
      // No session available - this should not happen
      console.error('Login attempted without session middleware');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: session not available'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', async (req: Request, res: Response) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({
            success: false,
            message: 'Error during logout'
          });
        }

        res.clearCookie('connect.sid');
        return res.status(200).json({
          success: true,
          message: 'Logout successful'
        });
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'No active session'
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (foundUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = foundUsers[0];

    // Don't send password
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
