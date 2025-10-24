
# Spotify Wizardry

Spotify Wizardry is a magical, full-stack web app that sorts your Spotify listening habits into whimsical houses—think Hogwarts meets Spotify Wrapped. The app features a vibrant, mobile-responsive UI, Spotify OAuth login, and a custom house sorting algorithm based on your top genres and artists.

## About This Project

This project was vibe coded and prompt engineered as a personal learning experiment to explore how far GitHub Copilot can go in building a real-world app. Every step, from initial setup to debugging OAuth and session issues, was guided by Copilot's suggestions and my own curiosity.

## Why I Built This

- To learn full-stack development with React, Express, and Spotify's API
- To test and push the limits of GitHub Copilot for coding, debugging, and architectural decisions
- To create a fun, portfolio-worthy app with magical theming and engaging UX

## How It Started

1. **Project Initialization**: Started with a basic React/Express monorepo, set up with Create React App and Express TypeScript boilerplate.
2. **Spotify OAuth Integration**: Implemented Spotify login using OAuth, handled redirect URI issues, and configured secure cookies for dev tunnels.
3. **House Sorting Algorithm**: Designed and tested a custom algorithm to sort users into houses based on their top genres and artists.
4. **Frontend Development**: Built a magical login page, responsive navbar, and interactive house cards with tooltips and animations.
5. **API & Testing**: Created RESTful endpoints for genres, wrapped data, and logout. Added comprehensive unit tests for both client and server.
6. **Debugging & Session Persistence**: Troubleshot session/cookie issues, refined CORS and proxy settings, and used Copilot to debug edge cases.
7. **Final Polish**: Enhanced mobile responsiveness, improved UI/UX, and documented the project for portfolio presentation.

## What I Learned

- How to prompt engineer and iterate with GitHub Copilot for real-world coding
- Deepened understanding of OAuth, session management, and cross-origin authentication
- Improved skills in React, Express, TypeScript, and testing frameworks
- The importance of clear documentation and debugging strategies

## Steps in Our Conversation

Throughout the build, I:
- Asked Copilot for project setup, README writing, and code scaffolding
- Debugged Spotify OAuth and session persistence with Copilot's help
- Implemented features like magical theming, mobile responsiveness, and house sorting
- Added and refined unit tests for high coverage
- Iterated on UI/UX and API design based on Copilot's suggestions
- Used Copilot to troubleshoot, refactor, and polish the app until it ran perfectly

## Running the App

1. Clone the repo and install dependencies in both `client` and `server` folders
2. Set up your `.env` files with Spotify API credentials and URLs
3. Start the server and client (`npm run dev` in each folder)
4. Log in with Spotify, get sorted into your magical house, and explore your top genres and artists

---


This project is a testament to the power of vibe coding and prompt engineering with GitHub Copilot. Every bug, feature, and design choice was a learning opportunity. Enjoy the magic!

---

## TODO

- [ ] Wire frontend to server `houseDetails` (replace client-side HOUSE_META with API response, show topArtists thumbnails)
- [ ] Deploy to Vercel (set up Vercel project, configure environment variables, test production build)
- [ ] Code cleanup (remove unused files, refactor for readability, ensure consistent formatting)
- [ ] Add more tests for edge cases and error handling
- [ ] Polish UI/UX for accessibility and performance

## Deployment

You can deploy this app to Vercel for easy hosting:

1. Push your code to GitHub
2. Create a new Vercel project and link your repo
3. Add environment variables for Spotify API and client/server URLs in Vercel dashboard
4. Deploy and test the app at your Vercel URL

---
