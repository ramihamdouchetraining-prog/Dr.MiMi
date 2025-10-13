import { Router } from 'express';
import passport from 'passport';
import { isOAuthConfigured } from '../oauth-config';

const router = Router();

// OAuth status endpoint
router.get('/status', (req, res) => {
  const status = isOAuthConfigured();
  res.json(status);
});

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login?error=oauth_failed' 
  }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  }
);

// Facebook OAuth routes
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: '/login?error=oauth_failed' 
  }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  }
);

// Microsoft OAuth routes (for Outlook)
router.get('/microsoft',
  passport.authenticate('microsoft')
);

router.get('/microsoft/callback',
  passport.authenticate('microsoft', { 
    failureRedirect: '/login?error=oauth_failed' 
  }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

export default router;