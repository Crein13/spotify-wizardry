
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';

// Extend session type for Spotify tokens
declare module 'express-session' {
  interface SessionData {
    accessToken?: string;
    refreshToken?: string;
  }
}
// Note: house sorting utilities are used within route handlers, not here

dotenv.config();

const app = express();

// Trust proxy - required for secure cookies behind proxies/tunnels
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://127.0.0.1:3000',
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Required for HTTPS (dev tunnels use HTTPS)
    httpOnly: true,
    sameSite: 'none', // Required for cross-site requests with dev tunnels
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Spotify API client is initialized within the spotify routes where needed

// Basic route
app.get('/', (req, res) => {
  res.send('Spotify Wizardry API is running!');
});

// Import routes
import spotifyRoutes from './routes/spotify';
import houseRoutes from './routes/house';

// Use routes
app.use('/', spotifyRoutes); // This will handle /auth/spotify and /auth/spotify/callback
app.use('/api/spotify', spotifyRoutes); // This will handle /api/spotify/*
app.use('/api', houseRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT: number = parseInt(process.env.PORT ?? "5000", 10);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Client URL: ${process.env.CLIENT_URL}`);
  console.log(`Redirect URI: ${process.env.SPOTIFY_REDIRECT_URI}`);
});