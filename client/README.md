
# Spotify Wizardry — Client

The client is a small React + TypeScript single-page app that lets a user log in with Spotify and be sorted into a Harry Potter–inspired music "house" (Auralis, Nocturne, Virtuo, Folklore) based on their listening tastes.

This README explains what the client does, how it displays house information, and how it consumes the server API (the server is the single source of truth for house descriptions, traits, and example artists).

## What is a "House" in this app?

- A house is a themed bucket inspired by Harry Potter houses but rebuilt around musical personalities.
- Each house (Auralis, Nocturne, Virtuo, Folklore) has:
	- a list of representative genres,
	- a short description and a larger "music personality" blurb,
	- traits and a small list of famous musicians used as examples.

The client shows the user's top house and a percentage breakdown for all houses, plus a compatibility score (how similar the other houses are to the top house for this user).

## How the client determines a house (overview)

- The client fetches top artist data from Spotify via the server and requests a house sort by POSTing to `/api/spotify/genres`.
- The server extracts genres from the user's top artists and runs `sortHouseByGenres(genres)` (see server README for details on the algorithm). The server returns:
	- `genres`: list of distinct genres found in the user's top artists,
	- `topArtists`: a lightweight list (name, Spotify URL, image, genres) used to enrich tooltips,
	- `allHouseDetails`: the server-side house metadata (descriptions, traits, etc.),
	- and the house sort result including `house`, `matchScore`, `housePercentages`, `normalizedPercentages`, `compatibility`, and `rawScores`.

The client uses these fields to render the Sorting Hat UI, per-house parchment tooltips, and example artist thumbnails.

## Data & Terms

- matchScore — a confidence value (0–100) calculated as the ratio of matching genres for the top house vs the total genres seen.
- housePercentages — raw per-house percentages computed against the total number of detected genres (may not sum to 100).
- normalizedPercentages — percentages normalized to sum exactly to 100 based on the score distribution; these are used for the UI bars.
- compatibility — a per-house score (0–100) representing how similar each house is to the top house. It is based on genre overlap (intersection/union), weighted by the house shares and scaled by the matchScore.

## Running the client

1. Install dependencies:

```bash
cd client
npm install
```

2. Start the dev server:

```bash
npm start
```

Open http://localhost:3000. The client expects the server to be running and reachable at the address configured in the environment (typically via `.env` / `CLIENT_URL`).

## Testing

The client includes a comprehensive test suite built with React Testing Library.

Run tests:

```bash
cd client
npm test                 # Run tests in watch mode
npm test -- --watchAll=false  # Run once
npm test -- --coverage   # Run with coverage report
```

**Test Coverage**: 31 tests, 76% code coverage

Test categories:
- Initial Render (4 tests)
- Authentication Flow (4 tests)
- Time Range Selector (4 tests)
- House Sorting (11 tests)
- Wrapped Data Display (5 tests)
- Accessibility (2 tests)

See `TESTING.md` for detailed test documentation.

## Time ranges

The client can request Spotify data for different time ranges (short_term, medium_term, long_term). The selected range is POSTed to `/api/spotify/genres` and the server fetches top artists for that range.

## Tooltip content and enrichment

- Tooltips (parchment style) are populated from `allHouseDetails` returned by the server so the frontend uses a single source of truth.
- The server also returns `topArtists` so the client can show thumbnail images and links to Spotify inside tooltips or example lists.

## Notes

- The client contains some themed styles (Sorting Hat animation, parchment tooltips). Keep `client/src/App.css` updated when changing tooltip behavior.
- If you change the house metadata on the server, the client will automatically show the updated descriptions on the next fetch.

## Learn more / Troubleshooting

- See the server README (`server/README.md`) for details about the sorting algorithm, API routes, and environment variables.
