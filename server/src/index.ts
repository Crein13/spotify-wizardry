
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import SpotifyWebApi from 'spotify-web-api-node';
import session from 'express-session';
import cookieParser from 'cookie-parser';

// Extend session type for Spotify tokens
declare module 'express-session' {
  interface SessionData {
    accessToken?: string;
    refreshToken?: string;
  }
}
import { sortHouseByGenres } from './utils/houseSort';

dotenv.config();

const app = express();

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
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // set to true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});