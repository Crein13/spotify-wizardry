import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:5000';
interface HouseInfo {
  house: string;
  description: string;
  traits: string[];
  musicPersonality: string;
  famousMusicians: string[];
  matchScore: number;
  housePercentages: Record<string, number>;
  compatibility: Record<string, number>;
  normalizedPercentages?: Record<string, number>;
  rawScores?: Record<string, number>;
}

interface Track {
  name: string;
  artists: { name: string }[];
  external_urls: { spotify: string };
}

interface Artist {
  name: string;
  genres: string[];
  external_urls: { spotify: string };
}

interface WrappedData {
  tracks: Track[];
  artists: Artist[];
}

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
    const [houseInfo, setHouseInfo] = useState<HouseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [wrappedData, setWrappedData] = useState<Record<string, WrappedData>>({});
  const timeRanges = [
    { key: 'short_term', label: 'Last 4 Weeks' },
    { key: 'medium_term', label: 'Last 6 Months' },
    { key: 'long_term', label: 'All Time' }
  ];

    // After login, fetch access token from backend session
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('loggedin')) {
      // Add a small delay to ensure session is saved
      setTimeout(() => {
        fetch(`${BACKEND_URL}/api/spotify/token`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
          .then(async (res) => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(
                `HTTP error! status: ${res.status}, details: ${JSON.stringify(errorData)}`
              );
            }
            return res.json();
          })
          .then((data) => {
            if (data.accessToken) {
              setAccessToken(data.accessToken);
              console.log('Successfully retrieved access token');
            } else {
              console.error('No access token in response:', data);
            }
          })
          .catch((error) => {
            console.error('Error fetching token:', error);
            // Redirect back to login if authentication failed
            window.location.href = `${BACKEND_URL}/auth/spotify`;
          });
      }, 1000); // 1 second delay

      // Remove query param from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch genres from backend
  const fetchGenres = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/spotify/genres`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json();
      setGenres(data.genres || []);
      setHouseInfo({
        house: data.house,
        description: data.description,
        traits: data.traits,
        musicPersonality: data.musicPersonality,
        famousMusicians: data.famousMusicians,
        matchScore: data.matchScore,
        housePercentages: data.housePercentages || {},
        compatibility: data.compatibility || {}
      ,
        normalizedPercentages: data.normalizedPercentages || {},
        rawScores: data.rawScores || {}
      });
    } catch (err) {
        console.error('Error fetching genres and house info:', err);
        alert('Error analyzing your music taste');
    }
    setLoading(false);
  };

  // Fetch wrapped data for each time range
  const fetchWrappedData = async (timeRange: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/spotify/wrapped?time_range=${timeRange}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setWrappedData(prev => ({
        ...prev,
        [timeRange]: data
      }));
    } catch (err) {
      console.error('Error fetching wrapped data:', err);
    }
  };

  // Fetch all wrapped data when logged in
  useEffect(() => {
    if (accessToken) {
      timeRanges.forEach(({ key }) => fetchWrappedData(key));
    }
  }, [accessToken]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Wizardry</h1>
        {!accessToken ? (
          <a className="App-link" href={`${BACKEND_URL}/auth/spotify`}>
            Login with Spotify
          </a>
        ) : (
          <>
            <p>Welcome, you are logged in!</p>
            <button onClick={fetchGenres} disabled={loading}>
              {loading ? 'Sorting...' : 'Sort My House!'}
            </button>
              {houseInfo && (
                <div className="house-info" style={{ marginTop: 20, maxWidth: '800px', textAlign: 'left', padding: '20px' }}>
                  <h2>Welcome to House {houseInfo.house}!</h2>
                  <div className="match-score" style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '1.2em' }}>
                      Match Score: <strong>{houseInfo.matchScore}%</strong>
                      <span
                        className="info-icon"
                        data-tip="Match Score is how well your detected genres match the top house (percentage of top house matches across your detected genres). Higher means the top house fits your tastes more closely."
                      >ⓘ</span>
                    </p>
                  </div>
                  <div className="house-description" style={{ marginBottom: '20px' }}>
                    <h3>About Your House</h3>
                    <p>{houseInfo.description}</p>
                  </div>
                  <div className="traits" style={{ marginBottom: '20px' }}>
                    <h3>House Traits</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {houseInfo.traits.map(trait => (
                        <span key={trait} style={{
                          padding: '5px 15px',
                          borderRadius: '20px',
                          backgroundColor: '#2c2c2c',
                          color: '#fff'
                        }}>
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="music-personality" style={{ marginBottom: '20px' }}>
                    <h3>Your Music Personality</h3>
                    <p>{houseInfo.musicPersonality}</p>
                  </div>
                  <div className="famous-musicians">
                    <h3>Notable House Members</h3>
                    <p>{houseInfo.famousMusicians.join(' • ')}</p>
                  </div>
                  <div className="genres" style={{ marginTop: '20px' }}>
                    <h3>Your Musical Genres</h3>
                    <p>{genres.join(', ')}</p>
                  </div>

                  {/* Other houses + compatibility */}
                  <div className="other-houses" style={{ marginTop: 30 }}>
                    <h3>
                      Other Houses & Compatibility
                      <span
                        className="info-icon"
                        data-tip="Compatibility combines genre overlap between houses and how much of your musical profile matches each house, then scales by the top house match confidence. It expresses stylistic similarity, not social personality."
                      >ⓘ</span>
                    </h3>
                    <div className="house-list">
                      {['Auralis', 'Nocturne', 'Virtuo', 'Folklore']
                        .filter((h) => {
                          // show house if it's the top house or has a raw score > 0
                          const raw = houseInfo.rawScores?.[h] ?? 0;
                          return h === houseInfo.house || raw > 0;
                        })
                        .map((h) => {
                        const pct = houseInfo.normalizedPercentages?.[h] ?? houseInfo.housePercentages?.[h] ?? 0;
                        const comp = houseInfo.compatibility?.[h] ?? 0;
                        const isTop = h === houseInfo.house;
                        return (
                          <div key={h} className="house-row" style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ color: isTop ? '#61dafb' : '#fff' }}>{h}</strong>
                              <span style={{ color: '#b8b8b8' }}>{pct}%</span>
                            </div>
                            <div className="percent-bar" style={{ background: '#2a2a2a', height: 12, borderRadius: 8, overflow: 'hidden', marginTop: 6 }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: isTop ? '#61dafb' : '#444' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' }}>
                              <small style={{ color: '#888' }}>Compatibility</small>
                              <small style={{ color: '#b8b8b8' }}>{comp}%</small>
                            </div>
                            <div className="compat-bar" style={{ background: '#1b1b1b', height: 8, borderRadius: 6, overflow: 'hidden', marginTop: 6 }}>
                              <div style={{ height: '100%', width: `${comp}%`, background: '#2ecc71' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
              </div>
            )}
            <section style={{ marginTop: 40 }}>
              <h2>Your Spotify Wrapped</h2>
              {timeRanges.map(({ key, label }) => (
                <div key={key} style={{ marginTop: 20 }}>
                  <h3>{label}</h3>
                  {wrappedData[key] && (
                    <div>
                      <div>
                        <h4>Top Tracks</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {wrappedData[key].tracks.map((track: Track) => (
                            <li key={track.name} style={{ margin: '10px 0' }}>
                              <a
                                href={track.external_urls.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="App-link"
                              >
                                {track.name}
                              </a>
                              <span> by {track.artists.map(a => a.name).join(', ')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4>Top Artists</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {wrappedData[key].artists.map((artist: Artist) => (
                            <li key={artist.name} style={{ margin: '10px 0' }}>
                              <a
                                href={artist.external_urls.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="App-link"
                              >
                                {artist.name}
                              </a>
                              <span> ({artist.genres.slice(0, 3).join(', ')})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </section>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
