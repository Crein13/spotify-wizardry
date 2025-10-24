import { Router } from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import { sortHouseByGenres, houseDetails } from '../utils/houseSort';

const router = Router();

// Validate environment variables
if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REDIRECT_URI) {
  console.error('MISSING SPOTIFY CREDENTIALS:', {
    hasClientId: !!process.env.SPOTIFY_CLIENT_ID,
    hasClientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
    hasRedirectUri: !!process.env.SPOTIFY_REDIRECT_URI
  });
  throw new Error('Missing required Spotify API credentials. Please check your environment variables.');
}

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

console.log('Spotify API initialized with redirect URI:', process.env.SPOTIFY_REDIRECT_URI);

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
    console.error('OAuth callback error: Missing code parameter');
    return res.status(400).send('Missing code parameter');
  }
  try {
    console.log('Attempting to exchange authorization code for token...');
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body['access_token'];
    const refreshToken = data.body['refresh_token'];

    console.log('Successfully received tokens from Spotify');

    // Store tokens in session
    if (!req.session) {
      console.error('Session not initialized');
      return res.status(500).send('Session not initialized');
    }

    // Save to session and wait for it to be saved
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;

    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          reject(err);
        } else {
          console.log('Session saved successfully');
          resolve(true);
        }
      });
    });

    // Redirect to frontend
    const redirectUrl = `${process.env.CLIENT_URL || 'http://127.0.0.1:3000'}?loggedin=true`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Spotify authentication error:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      body: error.body
    });
    res.status(500).send('Failed to authenticate with Spotify: ' + (error.message || 'Unknown error'));
  }
});

// Helper route: Get access token from session
router.get('/token', (req, res) => {
  console.log('Token request - Session exists:', !!req.session);
  console.log('Token request - Has accessToken:', !!req.session?.accessToken);

  if (!req.session) {
    console.error('No session available in token request');
    return res.status(500).json({ error: 'No session available' });
  }

  if (req.session.accessToken) {
    console.log('Returning access token from session');
    return res.json({ accessToken: req.session.accessToken });
  }

  console.log('No access token in session');
  return res.status(401).json({
    error: 'Not authenticated',
    details: 'No access token found in session'
  });
});

// Logout route: Clear session
router.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.clearCookie('connect.sid');
      return res.json({ success: true });
    });
  } else {
    return res.json({ success: true });
  }
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

    // Fetch images for famous musicians from each house
    const allHouseDetailsWithImages: any = {};
    for (const houseName of Object.keys(houseDetails)) {
      const house = houseDetails[houseName as keyof typeof houseDetails];
      const musiciansWithImages = await Promise.all(
        house.famousMusicians.map(async (musician: string) => {
          try {
            const searchResult = await spotifyApi.searchArtists(musician, { limit: 1 });
            const artist = searchResult.body.artists?.items[0];
            return {
              name: musician,
              image: artist?.images?.[0]?.url || null,
              spotifyUrl: artist?.external_urls?.spotify || null
            };
          } catch (err) {
            return { name: musician, image: null, spotifyUrl: null };
          }
        })
      );
      allHouseDetailsWithImages[houseName] = {
        ...house,
        famousMusicians: musiciansWithImages
      };
    }

    // Return genres, top artists, and the entire house sort result (including percentages and compatibility)
    res.json({
      genres,
      topArtists,
      allHouseDetails: allHouseDetailsWithImages,
      ...houseSortResult
    });
  } catch (error: any) {
    console.error('Error fetching genres:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch genres from Spotify.', details: error.message });
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
  } catch (error: any) {
    console.error('Error fetching wrapped data:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch wrapped data from Spotify.', details: error.message });
  }
});

// Get all house details with images
router.get('/houses', async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    spotifyApi.setAccessToken(req.session.accessToken);

    // Fetch images for famous musicians from each house
    const allHouseDetailsWithImages: any = {};
    for (const houseName of Object.keys(houseDetails)) {
      const house = houseDetails[houseName as keyof typeof houseDetails];
      const musiciansWithImages = await Promise.all(
        house.famousMusicians.map(async (musician: string) => {
          try {
            const searchResult = await spotifyApi.searchArtists(musician, { limit: 1 });
            const artist = searchResult.body.artists?.items[0];
            return {
              name: musician,
              image: artist?.images?.[0]?.url || null,
              spotifyUrl: artist?.external_urls?.spotify || null
            };
          } catch (err) {
            return { name: musician, image: null, spotifyUrl: null };
          }
        })
      );
      allHouseDetailsWithImages[houseName] = {
        ...house,
        famousMusicians: musiciansWithImages
      };
    }

    res.json({ allHouseDetails: allHouseDetailsWithImages });
  } catch (error: any) {
    console.error('Error fetching house details:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch house details from Spotify.', details: error.message });
  }
});

// Get basic house details (public, no auth required)
router.get('/houses/basic', (req, res) => {
  // Return house details without artist images (for public access)
  const basicHouseDetails: any = {};
  for (const houseName of Object.keys(houseDetails)) {
    const house = houseDetails[houseName as keyof typeof houseDetails];
    basicHouseDetails[houseName] = {
      genres: house.genres,
      description: house.description,
      traits: house.traits,
      musicPersonality: house.musicPersonality,
      famousMusicians: house.famousMusicians.map((name: string) => ({
        name,
        image: null,
        spotifyUrl: null
      }))
    };
  }
  res.json({ allHouseDetails: basicHouseDetails });
});

export default router;