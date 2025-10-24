# Spotify Wizardry — Server

This server powers the Spotify Wizardry app: it handles Spotify OAuth, fetches the user's top artists, extracts genres, and sorts the user into a Harry Potter–inspired music "house" (Auralis, Nocturne, Virtuo, Folklore).

The server is the single source of truth for house metadata (descriptions, traits, example musicians) and for the house-sorting algorithm.

## Responsibilities

- OAuth with Spotify (routes: `/auth/spotify`, `/auth/spotify/callback`).
- Provide a helper route to return the access token from the session (`/api/spotify/token`).
- Fetch user top tracks/artists for different time ranges and return wrapped data (`/api/spotify/wrapped`).
- Extract genres from top artists and compute the house sort result at (`POST /api/spotify/genres`).

## House metadata

- The module `server/src/utils/houseSort.ts` exports a `houseDetails` object describing each house:
  - genres: representative genres for the house,
  - description: short description used in tooltips,
  - traits: list of personality traits,
  - musicPersonality: a longer blurb describing what this house says about a user,
  - famousMusicians: example musicians associated with the house.

The client consumes `allHouseDetails` returned by the `/genres` endpoint so the frontend uses a single source of truth for house content.

## Sorting algorithm (how we compute a house)

The main function is `sortHouseByGenres(genres: string[])` which returns a `HouseSortResult` describing the assignment and metrics. Important fields:

- `house` — the top house (one of Auralis, Nocturne, Virtuo, Folklore).
- `matchScore` — a confidence score (0–100). Calculated as the number of matched genres for the top house divided by total distinct genres found in the user's top artists. If the user has few or no genres, this will be low.
- `housePercentages` — raw per-house percentages computed as (matching genres for the house / total genres) * 100. These may not sum to 100.
- `normalizedPercentages` — percentages normalized to sum to exactly 100 based on the distribution of per-house scores; this is the set shown in the UI progress bars.
- `compatibility` — per-house score (0–100) showing how similar each house is to the top house. This is computed by:
  1. Measuring genre overlap between the top house and the other house using intersection/union (Jaccard-style overlap).
  2. Combining overlap with the house's share (normalized percentage) using a weighted average (overlap weighted heavier).
  3. Scaling the result by the `matchScore` so the compatibility reflects confidence in the top house.
- `rawScores` — the raw integer counts for how many genres matched each house (useful for debugging or UI filters).

Algorithm notes & edge cases:

- Genre matching is case-insensitive and checks whether a detected genre contains the house's representative genre substring (this provides loose matching for genre variants).
- If the user has no detected genres (no top artists or artists with no genres), the algorithm returns zero matchScore and zero percentages.

## API (important endpoints)

- `GET /api/spotify/token` — returns `{ accessToken }` from session if available.
- `GET /auth/spotify` — redirect to Spotify for OAuth.
- `GET /auth/spotify/callback` — Spotify redirects back here; the server exchanges the code for tokens and saves them in the session.
- `GET /api/spotify/wrapped?time_range=<short_term|medium_term|long_term>` — returns the user's top tracks and artists for the requested period.
- `POST /api/spotify/genres` — request body: `{ accessToken: string, timeRange?: 'short_term' | 'medium_term' | 'long_term' }`.
  - Response (JSON) includes at least:
    - `genres`: array of distinct genres discovered,
    - `topArtists`: array of lightweight artist objects ({ name, spotifyUrl, image, genres }) used to enrich tooltips,
    - `allHouseDetails`: the house metadata mapping,
    - the house sort result: `house`, `matchScore`, `housePercentages`, `normalizedPercentages`, `compatibility`, `rawScores`, etc.

The client expects this response shape when it triggers the sorting operation.

## Environment variables

Set the following in your environment (or in a `.env` file loaded by the app):

- `SPOTIFY_CLIENT_ID` — your Spotify app client id
- `SPOTIFY_CLIENT_SECRET` — your Spotify app client secret
- `SPOTIFY_REDIRECT_URI` — the OAuth redirect URI configured in your Spotify app and in the server
- `CLIENT_URL` — the frontend URL used to redirect after OAuth (defaults to http://127.0.0.1:3000)

## Run & develop

Install dependencies and run in dev mode with hot reload:

```bash
cd server
npm install
npm run dev
```

Build for production:

```bash
cd server
npm run build
npm start
```

## Types

Key exported types (in `server/src/utils/houseSort.ts`):

- `HouseName` (`'Auralis'|'Nocturne'|'Virtuo'|'Folklore'`)
- `HouseInfo` — shape of the house metadata
- `HouseSortResult` — the result returned by `sortHouseByGenres` (see fields above)

## Extending or localizing house content

- Because `houseDetails` is exported and returned by the `/genres` endpoint, you can update descriptions, traits, or example musicians in `server/src/utils/houseSort.ts` and the client will automatically pick up the changes.
- For localization, consider changing `houseDetails` to include per-locale fields (e.g. `description: { en: '...', es: '...' }`) and have the client request or select the appropriate locale.

## Troubleshooting

- If the `/genres` endpoint returns empty `genres`, make sure the Spotify tokens are in the session or that the `accessToken` passed in the request body is valid.
- Check server logs for OAuth or Spotify API errors; rate limits and token expiration are common causes of failures.

## License & theme

- This project is inspired by Harry Potter themes but uses original house names and descriptions tailored to music taste. Use the materials responsibly.
