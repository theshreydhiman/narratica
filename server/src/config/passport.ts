import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { processAchievements } from '../services/gamification';

export function configurePassport(): void {
  // Serialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local Strategy (email + password)
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ where: { email } });
          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          if (!user.password) {
            return done(null, false, { message: 'Please login with Google' });
          }
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ where: { googleId: profile.id } });
            if (!user) {
              user = await User.findOne({ where: { email: profile.emails?.[0]?.value } });
              if (user) {
                user.googleId = profile.id;
                user.avatarUrl = profile.photos?.[0]?.value || undefined;
                await user.save();
              } else {
                user = await User.create({
                  email: profile.emails?.[0]?.value || '',
                  name: profile.displayName,
                  googleId: profile.id,
                  avatarUrl: profile.photos?.[0]?.value,
                  skillLevel: 'beginner',
                  onboardingComplete: false,
                  streakCount: 0,
                  totalWords: 0,
                });
                // Award "getting_started" achievement for new Google users
                await processAchievements(user.id);
              }
            }
            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }
}
