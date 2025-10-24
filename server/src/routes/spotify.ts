import { Router } from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import { sortHouseByGenres, houseDetails } from '../utils/houseSort';

const router = Router();
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Spotify OAuth: Step 1 - Redirect to Spotify login
router.get('/auth/spotify', (req, res) => {
  const scopes = 'user-top-read';
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const spotifyAuthUrl =
    'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    `&client_id=${encodeURIComponent(clientId || '')}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri || '')}`;
  res.redirect(spotifyAuthUrl);
});

// Spotify OAuth: Step 2 - Handle callback and exchange code for token
router.get('/auth/spotify/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send('Missing code parameter');
  }
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body['access_token'];
    const refreshToken = data.body['refresh_token'];

    // Store tokens in session
    if (!req.session) {
      return res.status(500).send('Session not initialized');
    }

    // Save to session and wait for it to be saved
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;

    await new Promise((resolve) => req.session.save(resolve));

    // Redirect to frontend
    res.redirect(`${process.env.CLIENT_URL || 'http://127.0.0.1:3000'}?loggedin=true`);
  } catch (error) {
    res.status(500).send('Failed to authenticate with Spotify');
  }
});

// Helper route: Get access token from session
router.get('/token', (req, res) => {
  if (!req.session) {
    return res.status(500).json({ error: 'No session available' });
  }

  if (req.session.accessToken) {
    return res.json({ accessToken: req.session.accessToken });
  }

  return res.status(401).json({
    error: 'Not authenticated',
    details: 'No access token found in session'
  });
});

// Get user's top genres and sort house
router.post('/genres', async (req, res) => {
  const { accessToken, timeRange = 'long_term' } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: 'Missing Spotify access token.' });
  }
  try {
    spotifyApi.setAccessToken(accessToken);
    // Fetch top artists for the requested time range
    const topArtistsData = await spotifyApi.getMyTopArtists({ limit: 20, time_range: timeRange });
    const genresSet = new Set<string>();
    topArtistsData.body.items.forEach((artist: any) => {
      artist.genres.forEach((genre: string) => genresSet.add(genre));
    });
    const genres = Array.from(genresSet);

    // Build a lightweight topArtists array to return to the client (for tooltip examples)
    const topArtists = topArtistsData.body.items.map((artist: any) => ({
      name: artist.name,
      spotifyUrl: artist.external_urls?.spotify,
      image: Array.isArray(artist.images) && artist.images.length > 0 ? artist.images[0].url : null,
      genres: artist.genres || []
    }));

    const houseSortResult = sortHouseByGenres(genres);
    // Return genres, top artists, and the entire house sort result (including percentages and compatibility)
    res.json({
      genres,
      topArtists,
      allHouseDetails: houseDetails,
      ...houseSortResult
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres from Spotify.' });
  }
});

// Get wrapped data
router.get('/wrapped', async (req, res) => {
  const allowedRanges = ['short_term', 'medium_term', 'long_term'] as const;
  let timeRange = req.query.time_range as 'short_term' | 'medium_term' | 'long_term' | undefined;
  if (!allowedRanges.includes(timeRange as any)) {
    timeRange = 'long_term';
  }
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    spotifyApi.setAccessToken(req.session.accessToken);
    const topTracksData = await spotifyApi.getMyTopTracks({ limit: 10, time_range: timeRange });
    const topArtistsData = await spotifyApi.getMyTopArtists({ limit: 10, time_range: timeRange });
    res.json({
      tracks: topTracksData.body.items || [],
      artists: topArtistsData.body.items || [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wrapped data from Spotify.' });
  }
});

export default router;