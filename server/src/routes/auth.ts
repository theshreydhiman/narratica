import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { processAchievements } from '../services/gamification';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, skillLevel } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Email, password, and name are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      skillLevel: skillLevel || 'beginner',
      onboardingComplete: false,
      streakCount: 0,
      totalWords: 0,
    });

    // Award "getting_started" achievement
    await processAchievements(user.id);

    req.login(user, (err) => {
      if (err) return res.status(500).json({ success: false, error: 'Login failed after registration' });
      const { password: _, ...userData } = user.toJSON();
      return res.status(201).json({ success: true, data: { user: userData } });
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) return res.status(500).json({ success: false, error: 'Authentication error' });
    if (!user) return res.status(401).json({ success: false, error: info?.message || 'Invalid credentials' });
    req.login(user, (loginErr) => {
      if (loginErr) return res.status(500).json({ success: false, error: 'Login failed' });
      const { password: _, ...userData } = user.toJSON();
      return res.json({ success: true, data: { user: userData } });
    });
  })(req, res, next);
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_failed` }),
  (_req: Request, res: Response) => {
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  }
);

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ success: false, error: 'Logout failed' });
    return res.json({ success: true, message: 'Logged out' });
  });
});

// Get current user
router.get('/me', (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  const { password: _, ...userData } = (req.user as any).toJSON();
  return res.json({ success: true, data: { user: userData } });
});

export default router;
