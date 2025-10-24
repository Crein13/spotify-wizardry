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
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('long_term');
  const [hatTilt, setHatTilt] = useState(false);
  const [houseFlash, setHouseFlash] = useState(false);
  const timeRanges = [
    { key: 'short_term', label: 'Last 4 Weeks' },
    { key: 'medium_term', label: 'Last 6 Months' },
    { key: 'long_term', label: 'All Time' }
  ];

  // Short descriptions for each house to show in tooltips (music-personality focused)
  const HOUSE_META: Record<string, { shortDesc: string; musicPersonality: string; examples?: string[] }> = {
    Auralis: {
      shortDesc: 'The House of Energy and Innovation — drawn to upbeat, modern, and danceable sounds.',
      musicPersonality: "You thrive on rhythm and bold production; music energizes your day.",
      examples: ['Lady Gaga', 'The Weeknd']
    },
    Nocturne: {
      shortDesc: 'The House of Depth and Mystery — favors moody, atmospheric, and soulful music.',
      musicPersonality: "You listen for feeling and texture; songs are emotional landscapes to you.",
      examples: ['Billie Eilish', 'Frank Ocean']
    },
    Virtuo: {
      shortDesc: 'The House of Mastery and Experimentation — appreciates complex, technical compositions.',
      musicPersonality: "You value craftsmanship and subtlety; intricate arrangements speak to you.",
      examples: ['Miles Davis', 'Beethoven']
    },
    Folklore: {
      shortDesc: 'The House of Story and Tradition — loves acoustic, lyrical, and authentic songwriting.',
      musicPersonality: "You connect through stories and honest performances; lyrics matter most.",
      examples: ['Joni Mitchell', 'Bob Dylan']
    }
  };

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
            } else {
              // Redirect back to login if no access token
              window.location.href = `${BACKEND_URL}/auth/spotify`;
            }
          })
          .catch(() => {
            // Redirect back to login if authentication failed
            window.location.href = `${BACKEND_URL}/auth/spotify`;
          });
      }, 1000); // 1 second delay

      // Remove query param from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch genres from backend (for a given time range)
  const fetchGenres = async (timeRange: string = selectedTimeRange) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/spotify/genres`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, timeRange }),
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
        compatibility: data.compatibility || {},
        normalizedPercentages: data.normalizedPercentages || {},
        rawScores: data.rawScores || {}
      });
      // trigger flash when a new house result arrives
      setHouseFlash(true);
      setTimeout(() => setHouseFlash(false), 700);
    } catch (err) {
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
      // Silently handle error - wrapped data is optional
    }
  };

  // Fetch wrapped data and genres for the selected time range when logged in or when the range changes
    useEffect(() => {
      if (accessToken) {
        fetchWrappedData(selectedTimeRange);
      }
    }, [accessToken, selectedTimeRange]);

  const handleTimeRangeChange = (timeRange: string) => {
    setSelectedTimeRange(timeRange);
    // Clear house info when changing time ranges
    setHouseInfo(null);
    setGenres([]);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/spotify/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      // Clear local state
      setAccessToken(null);
      setHouseInfo(null);
      setGenres([]);
      setWrappedData({});
      setSelectedTimeRange('long_term');
    } catch (error) {
      // Even if the request fails, clear local state
      setAccessToken(null);
      setHouseInfo(null);
      setGenres([]);
      setWrappedData({});
      setSelectedTimeRange('long_term');
    }
  };

  return (
    <div className="App">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <h1 className="navbar-title">Spotify Wizardry</h1>
          {accessToken && (
            <button onClick={handleLogout} className="logout-btn" aria-label="Logout">
              Logout
            </button>
          )}
        </div>
      </nav>

      <header className="App-header">
        {!accessToken ? (
          <a className="spotify-login-btn" href={`${BACKEND_URL}/auth/spotify`}>
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Login with Spotify
          </a>
        ) : (
          <>
            {/* Time Range Selector */}
            <div className="time-range-selector">
              {timeRanges.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleTimeRangeChange(key)}
                  className={`time-range-button ${selectedTimeRange === key ? 'active' : ''}`}
                  aria-pressed={selectedTimeRange === key}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              className="sort-button"
              onClick={() => {
                // tilt the hat for a moment to give feedback
                setHatTilt(true);
                setTimeout(() => setHatTilt(false), 600);
                fetchGenres(selectedTimeRange);
              }}
              disabled={loading}
              aria-label="Sort my house"
            >
              <svg className={`sorting-hat ${hatTilt ? 'tilt' : ''}`} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M4 15c1-3 7-5 8-5s7 2 8 5c0 0-1 2-2 2H6c-1 0-2-2-2-2z" fill="#2b1e12" />
                <path d="M2 12c3-6 9-8 10-8s7 2 10 8c0 0-2 3-4 3H6c-2 0-4-3-4-3z" fill="#3b2a18" />
                <path d="M6 8c1-1 5-2 6-2s5 1 6 2c0 0-1 1-2 1H8c-1 0-2-1-2-1z" fill="#4b371f" />
              </svg>
              <span className="sort-text">{loading ? 'Sorting...' : 'Sort My House!'}</span>
            </button>
              {houseInfo && (
                <div className={`house-info ${houseFlash ? 'flash' : ''}`} style={{ marginTop: 20, maxWidth: '800px', textAlign: 'left', padding: '20px' }}>
                  <h2>Welcome to House {houseInfo.house}!</h2>
                  <div className="match-score" style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '1.2em' }}>
                      Match Score: <strong>{houseInfo.matchScore}%</strong>
                      <span
                        className="info-icon"
                        tabIndex={0}
                        role="button"
                        aria-label="About Match Score"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.currentTarget.focus();
                          }
                        }}
                        data-tip="Shows how well your music matches this house's style. Higher score means stronger alignment with the house's musical identity."
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
                        tabIndex={0}
                        role="button"
                        aria-label="About Compatibility"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.currentTarget.focus();
                          }
                        }}
                        data-tip="Shows musical overlap between houses based on shared genres and your listening profile. Higher numbers suggest similar musical styles."
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
                        const meta = HOUSE_META[h] || { shortDesc: '', musicPersonality: '' };
                        const tipText = `${meta.shortDesc} ${meta.musicPersonality} ${meta.examples ? 'Notable: ' + meta.examples.join(', ') : ''}`;
                        return (
                          <div key={h} className="house-row" style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <strong style={{ color: isTop ? '#61dafb' : '#fff' }}>{h}</strong>
                                <span
                                  className="info-icon"
                                  tabIndex={0}
                                  role="button"
                                  aria-label={`Details for ${h}`}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      e.currentTarget.focus();
                                    }
                                  }}
                                  data-tip={tipText}
                                >ⓘ</span>
                              </div>
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
              {wrappedData[selectedTimeRange] && (
                <div style={{ marginTop: 20 }}>
                  <h3>{timeRanges.find(t => t.key === selectedTimeRange)?.label}</h3>
                  <div>
                    <h4>Top Tracks</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {wrappedData[selectedTimeRange].tracks.map((track: Track) => (
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
                      {wrappedData[selectedTimeRange].artists.map((artist: Artist) => (
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
            </section>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
