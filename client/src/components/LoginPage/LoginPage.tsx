import React from 'react';
import { HouseName, HouseInfo } from '../../types/api';
import './LoginPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

interface LoginPageProps {
  allHouseDetails?: Record<HouseName, HouseInfo> | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ allHouseDetails }) => {
  const [activeTooltip, setActiveTooltip] = React.useState<HouseName | null>(null);
  const houses: HouseName[] = ['Auralis', 'Nocturne', 'Virtuo', 'Folklore'];

  // Distinct symbols for each house
  const houseEmojis: Record<HouseName, string> = {
    Auralis: '🎶',
    Nocturne: '🌙',
    Virtuo: '🎻',
    Folklore: '🪕',
  };

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/spotify`;
  };

  const handleHouseClick = (house: HouseName) => {
    if (activeTooltip === house) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(house);
    }
  };

  const handleCloseTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTooltip(null);
  };

  return (
    <div className="login-container">
      <h1 className="login-main-title">✨ Welcome to Spotify Wizardry ✨</h1>
      <p className="login-main-description">
        Discover which musical house you belong to based on your Spotify listening habits!
      </p>

      {allHouseDetails && Object.keys(allHouseDetails).length > 0 && (
        <div className="houses-overview">
          <h2 className="houses-title">The Four Houses of Musical Wizardry</h2>

          <div className="houses-grid">
            {houses.map((house) => {
              const details = allHouseDetails?.[house];
              if (!details) return null;

              return (
                <div
                  key={house}
                  className={`house-card-login ${activeTooltip === house ? 'active' : ''}`}
                  onClick={() => handleHouseClick(house)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleHouseClick(house);
                    }
                  }}
                >
                  <h3 className="house-name">{house}</h3>
                  <div className="house-symbol">{houseEmojis[house]}</div>

                  {activeTooltip === house && (
                    <div className="house-tooltip" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="tooltip-close"
                        onClick={handleCloseTooltip}
                        aria-label="Close tooltip"
                      >
                        ×
                      </button>

                      <div className="tooltip-content">
                        <p className="tooltip-description">
                          {details.description.split('.')[0]}.
                        </p>

                        <p className="tooltip-text">
                          <em>Traits:</em> {details.traits.join(', ')}.
                        </p>

                        <p className="tooltip-text">
                          <em>Genres:</em> {details.genres.slice(0, 4).join(', ')}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="login-card">
        <a className="spotify-login-btn" href={`${BACKEND_URL}/auth/spotify`}>
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Login with Spotify
        </a>
      </div>
    </div>
  );
};
