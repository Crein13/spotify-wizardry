import React, { useState, useEffect } from 'react';
import './App.css';
import type { GenresApiResponse, TopArtist, HouseName, HouseInfo as ApiHouseInfo, HouseSortResult } from './types/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:5000';

// Normalized wrapped types for UI rendering with images
interface WrappedTrack {
  name: string;
  artistNames: string[];
  url: string;
  cover?: string | null;
}

interface WrappedArtist {
  name: string;
  url: string;
  image?: string | null;
  genres: string[];
}

interface WrappedData {
  tracks: WrappedTrack[];
  artists: WrappedArtist[];
}

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [houseInfo, setHouseInfo] = useState<HouseSortResult | null>(null);
  const [topArtists, setTopArtists] = useState<TopArtist[]>([]);
  const [allHouseDetails, setAllHouseDetails] = useState<Record<HouseName, ApiHouseInfo> | null>(null);
  const [loading, setLoading] = useState(false);
  const [wrappedData, setWrappedData] = useState<Record<string, WrappedData>>({});
  const [wrappedLoading, setWrappedLoading] = useState<Record<string, boolean>>({});
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('long_term');
  const [sortedTimeRange, setSortedTimeRange] = useState<string | null>(null);
  const [hatTilt, setHatTilt] = useState(false);
  const [houseFlash, setHouseFlash] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type?: 'success' | 'error' | 'info' }>>([]);
  const toastIdRef = React.useRef(0);
  const timeRanges = [
    { key: 'short_term', label: 'Last 4 Weeks' },
    { key: 'medium_term', label: 'Last 6 Months' },
    { key: 'long_term', label: 'All Time' }
  ];
  // All house metadata now comes from the server via allHouseDetails

  // Toast helpers
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', timeout = 3000) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeout);
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

  // Fetch genres from backend (for a given time range) with retry
  const fetchGenres = async (timeRange: string = selectedTimeRange) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      // Retry fetch up to 3 times with backoff
      const doFetch = async () => {
        const res = await fetch(`${BACKEND_URL}/api/spotify/genres`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, timeRange }),
        });
        if (!res.ok) {
          let details = '';
          try { details = JSON.stringify(await res.json()); } catch {}
          throw new Error(`Failed to fetch genres (${res.status}). ${details}`);
        }
        return res.json();
      };

      let data: Partial<GenresApiResponse> | null = null;
      let lastError: any = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const result = await doFetch();
          data = result;
          break;
        } catch (e) {
          lastError = e;
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 500 * attempt));
          }
        }
      }
      if (!data) throw lastError || new Error('Unknown error fetching genres');

      setGenres(Array.isArray(data.genres) ? data.genres : []);
      setTopArtists(Array.isArray(data.topArtists) ? data.topArtists : []);
      setAllHouseDetails(data.allHouseDetails || null);
      if (data && data.house) {
        setHouseInfo({
          house: data.house as any,
          description: (data as any).description || '',
          traits: Array.isArray((data as any).traits) ? (data as any).traits : [],
          musicPersonality: (data as any).musicPersonality || '',
          famousMusicians: Array.isArray((data as any).famousMusicians) ? (data as any).famousMusicians : [],
          matchScore: (data as any).matchScore ?? 0,
          housePercentages: (data as any).housePercentages || ({} as any),
          compatibility: (data as any).compatibility || ({} as any),
          normalizedPercentages: (data as any).normalizedPercentages || ({} as any),
          rawScores: (data as any).rawScores || ({} as any)
        });
        setSortedTimeRange(timeRange);
        showToast('House sorted!', 'success', 2000);
      } else {
        // no valid result
        setHouseInfo(null);
        setSortedTimeRange(null);
        showToast('Could not determine your house. Try again.', 'error');
      }
      // trigger flash when a new house result arrives
      setHouseFlash(true);
      setTimeout(() => setHouseFlash(false), 700);
    } catch (err) {
      console.error(err);
      showToast('Error analyzing your music taste. Please try again.', 'error');
    }
    setLoading(false);
  };

  // Fetch wrapped data for each time range
  const fetchWrappedData = async (timeRange: string) => {
    if (!accessToken) return;
    try {
      setWrappedLoading(prev => ({ ...prev, [timeRange]: true }));
      const res = await fetch(`${BACKEND_URL}/api/spotify/wrapped?time_range=${timeRange}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const raw = await res.json();
      // Normalize server response to include image URLs for UI
      const normalized: WrappedData = {
        tracks: Array.isArray(raw.tracks)
          ? raw.tracks.map((t: any) => ({
              name: t?.name,
              artistNames: Array.isArray(t?.artists) ? t.artists.map((a: any) => a?.name).filter(Boolean) : [],
              url: t?.external_urls?.spotify || '#',
              cover: Array.isArray(t?.album?.images) && t.album.images.length > 0 ? t.album.images[0].url : null,
            }))
          : [],
        artists: Array.isArray(raw.artists)
          ? raw.artists.map((a: any) => ({
              name: a?.name,
              url: a?.external_urls?.spotify || '#',
              image: Array.isArray(a?.images) && a.images.length > 0 ? a.images[0].url : null,
              genres: Array.isArray(a?.genres) ? a.genres : [],
            }))
          : []
      };
      setWrappedData(prev => ({ ...prev, [timeRange]: normalized }));
    } catch (err) {
      // Silently handle error - wrapped data is optional
    }
    finally {
      setWrappedLoading(prev => ({ ...prev, [timeRange]: false }));
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
    // Clear house info and sorted state when changing time ranges
    setHouseInfo(null);
    setGenres([]);
    setSortedTimeRange(null);
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
      {/* Toast Notifications */}
      <div className="toasts" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type || 'info'}`}>
            {t.message}
          </div>
        ))}
      </div>
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
          <div className="login-container">
            {/* Magical decorative elements */}
            <div className="magic-decorations">
              <div className="magic-icon hat-icon">🎩</div>
              <div className="magic-icon wand-icon">🪄</div>
              <div className="magic-icon star-icon">✨</div>
            </div>

            {/* House symbols */}
            <div className="house-symbols">
              <div className="house-symbol auralis">⚡</div>
              <div className="house-symbol nocturne">🌙</div>
              <div className="house-symbol virtuo">📚</div>
              <div className="house-symbol folklore">🎵</div>
            </div>

            {/* Main welcome content */}
            <div className="welcome-content">
              <h2 className="welcome-title">✨ Welcome to Spotify Wizardry ✨</h2>
              <p className="welcome-subtitle">
                Discover your Hogwarts house based on your Spotify music taste
              </p>
              <p className="welcome-description">
                Let the Sorting Hat analyze your musical preferences and place you in one of four magical houses:
              </p>

              <div className="houses-preview">
                <div className="house-preview">
                  <span className="house-emoji">⚡</span>
                  <span className="house-name">Auralis</span>
                </div>
                <div className="house-preview">
                  <span className="house-emoji">🌙</span>
                  <span className="house-name">Nocturne</span>
                </div>
                <div className="house-preview">
                  <span className="house-emoji">📚</span>
                  <span className="house-name">Virtuo</span>
                </div>
                <div className="house-preview">
                  <span className="house-emoji">🎵</span>
                  <span className="house-name">Folklore</span>
                </div>
              </div>

              <a className="spotify-login-btn" href={`${BACKEND_URL}/auth/spotify`}>
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Login with Spotify
              </a>
            </div>
          </div>
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
            {sortedTimeRange === selectedTimeRange && houseInfo ? (
              <div className="sorted-house-badge">
                <span className="house-symbol-badge">
                  {houseInfo.house === 'Auralis' ? '⚡' :
                   houseInfo.house === 'Nocturne' ? '🌙' :
                   houseInfo.house === 'Virtuo' ? '📚' : '🎵'}
                </span>
                <span className="house-name-badge">House {houseInfo.house}</span>
              </div>
            ) : (
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
            )}
              {houseInfo ? (
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
                      {(houseInfo.traits || []).map(trait => (
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
                    <p>{houseInfo.musicPersonality || ''}</p>
                  </div>
                  <div className="famous-musicians">
                    <h3>Notable House Members</h3>
                    <p>{(houseInfo.famousMusicians || []).map((m: any) => m.name || m).join(' • ')}</p>
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
                      {(['Auralis', 'Nocturne', 'Virtuo', 'Folklore'] as HouseName[])
                        .filter((h) => {
                          // show house if it's the top house or has a raw score > 0
                          const raw = (houseInfo.rawScores as any)?.[h] ?? 0;
                          return h === houseInfo.house || raw > 0;
                        })
                        .map((h) => {
                        const pct = (houseInfo.normalizedPercentages as any)?.[h] ?? (houseInfo.housePercentages as any)?.[h] ?? 0;
                        const comp = (houseInfo.compatibility as any)?.[h] ?? 0;
                        const isTop = h === houseInfo.house;
                        return (
                          <div key={h} className="house-row" style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <strong style={{ color: isTop ? '#61dafb' : '#fff' }}>{h}</strong>
                                <span
                                  className="info-icon thumb-tooltip"
                                  tabIndex={0}
                                  role="button"
                                  aria-label={`Details for ${h}`}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      e.currentTarget.focus();
                                    }
                                  }}
                                >
                                  ⓘ
                                  <div className="tooltip-box" role="dialog" aria-label={`${h} details`}>
                                    <div className="tooltip-text">
                                      {allHouseDetails?.[h]?.musicPersonality || ''}
                                    </div>
                                    {allHouseDetails?.[h]?.famousMusicians?.length ? (
                                      <div className="tooltip-notable">
                                        Notable: {allHouseDetails[h].famousMusicians.slice(0, 3).map((m: any) => m.name).join(', ')}
                                      </div>
                                    ) : null}
                                    {allHouseDetails?.[h]?.famousMusicians?.length ? (
                                      <div className="tooltip-artists" aria-label="Famous artists from this house">
                                        {allHouseDetails[h].famousMusicians.slice(0, 3).map((musician: any, idx: number) => (
                                          <a
                                            key={musician.name + idx}
                                            href={musician.spotifyUrl || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={musician.name}
                                            className="artist-thumb famous-artist"
                                          >
                                            {musician.image ? (
                                              <img loading="lazy" src={musician.image} alt={musician.name} />
                                            ) : (
                                              <span className="artist-fallback">{musician.name.charAt(0)}</span>
                                            )}
                                          </a>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                </span>
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
            ) : (
              <div className="house-info empty-state" style={{ marginTop: 20, maxWidth: '800px', textAlign: 'center', padding: '24px' }}>
                <div className="empty-emoji" aria-hidden>🪄</div>
                <h3 className="empty-title">Ready for Sorting</h3>
                <p className="empty-text">Choose a time range and tap "Sort My House!" to reveal your magical musical house.</p>
              </div>
            )}
            <section style={{ marginTop: 40 }}>
              <h2>Your Spotify Wrapped</h2>
              {wrappedData[selectedTimeRange] ? (
                <div style={{ marginTop: 20 }}>
                  <h3>{timeRanges.find(t => t.key === selectedTimeRange)?.label}</h3>
                  <div>
                    <h4>Top Tracks</h4>
                    <div className="wrapped-grid">
                      {(wrappedLoading[selectedTimeRange] ? Array.from({ length: 8 }, (_, i) => ({ __key: i })) : wrappedData[selectedTimeRange].tracks).map((track: any) => (
                        <a
                          key={track.__key ?? track.name + track.url}
                          href={track.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`card track-card ${track.__key !== undefined ? 'skeleton' : ''}`}
                          aria-label={track.__key !== undefined ? 'Loading track' : `Open ${track.name} on Spotify`}
                        >
                          <div className="cover">
                            {track.__key !== undefined ? (
                              <div className="cover-fallback shimmer" />
                            ) : track.cover ? (
                              <img loading="lazy" src={track.cover} alt={`${track.name} cover`} />
                            ) : (
                              <div className="cover-fallback">♪</div>
                            )}
                          </div>
                          <div className="card-text">
                            <div className="title" title={track.name}>{track.__key !== undefined ? '\u00A0' : track.name}</div>
                            <div className="subtitle" title={track.artistNames?.join(', ')}>
                              {track.__key !== undefined ? '\u00A0' : track.artistNames.join(', ')}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4>Top Artists</h4>
                    <div className="wrapped-grid">
                      {(wrappedLoading[selectedTimeRange] ? Array.from({ length: 8 }, (_, i) => ({ __key: i })) : wrappedData[selectedTimeRange].artists).map((artist: any) => (
                        <a
                          key={artist.__key ?? artist.name + artist.url}
                          href={artist.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`card artist-card ${artist.__key !== undefined ? 'skeleton' : ''}`}
                          aria-label={artist.__key !== undefined ? 'Loading artist' : `Open ${artist.name} on Spotify`}
                        >
                          <div className="avatar">
                            {artist.__key !== undefined ? (
                              <div className="avatar-fallback shimmer" />
                            ) : artist.image ? (
                              <img loading="lazy" src={artist.image} alt={`${artist.name} photo`} />
                            ) : (
                              <div className="avatar-fallback">{artist.name.charAt(0)}</div>
                            )}
                          </div>
                          <div className="card-text">
                            <div className="title" title={artist.name}>{artist.__key !== undefined ? '\u00A0' : artist.name}</div>
                            <div className="subtitle" title={artist.genres?.slice(0,3).join(', ')}>
                              {artist.__key !== undefined ? '\u00A0' : artist.genres.slice(0, 3).join(', ')}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : !wrappedLoading[selectedTimeRange] ? (
                <div className="house-info empty-state" style={{ marginTop: 20, maxWidth: '800px', textAlign: 'center', padding: '24px' }}>
                  <div className="empty-emoji" aria-hidden>🎧</div>
                  <h3 className="empty-title">No Wrapped Yet</h3>
                  <p className="empty-text">We'll fetch your top tracks and artists once you're sorted—or try another time range.</p>
                </div>
              ) : null}
            </section>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
