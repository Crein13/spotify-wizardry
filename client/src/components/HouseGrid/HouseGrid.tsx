import React, { useState } from 'react';
import { HouseName, HouseInfo } from '../../types/api';
import './HouseGrid.css';

interface HouseGridProps {
  allHouseDetails: Record<HouseName, HouseInfo>;
  onHouseClick?: (house: HouseName) => void;
}

export const HouseGrid: React.FC<HouseGridProps> = ({ allHouseDetails, onHouseClick }) => {
  const [activeTooltip, setActiveTooltip] = useState<HouseName | null>(null);
  const houses: HouseName[] = ['Auralis', 'Nocturne', 'Virtuo', 'Folklore'];

  const handleHouseClick = (house: HouseName) => {
    if (activeTooltip === house) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(house);
    }
    onHouseClick?.(house);
  };

  const handleCloseTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTooltip(null);
  };

  return (
    <div className="house-grid">
      <h2 className="house-grid-title">Discover the Houses of Musical Wizardry</h2>
      <p className="house-grid-subtitle">Click on a house to learn more about its magical musical essence</p>

      <div className="house-cards">
        {houses.map((house) => {
          const details = allHouseDetails?.[house];
          if (!details) return null;

          return (
            <div
              key={house}
              className={`house-card ${activeTooltip === house ? 'active' : ''}`}
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
              <div className="house-card-header">
                <h3 className="house-card-name">{house}</h3>
                <div className="house-card-icon">{house === 'Auralis' ? '�' : house === 'Nocturne' ? '🌙' : house === 'Virtuo' ? '🎻' : '🪕'}</div>
              </div>

              {activeTooltip === house && (
                <div className="house-tooltip" onClick={(e) => e.stopPropagation()}>
                  <div className="tooltip-hat">🧙‍♀️</div>
                  <button
                    className="tooltip-close"
                    onClick={handleCloseTooltip}
                    aria-label="Close tooltip"
                  >
                    ×
                  </button>

                  <div className="tooltip-content">
                    <p className="tooltip-description">{details.description}</p>

                    <div className="tooltip-section">
                      <h4>Musical Genres</h4>
                      <div className="tooltip-genres">
                        {details.genres.map((genre) => (
                          <span key={genre} className="genre-tag">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="tooltip-section">
                      <h4>House Traits</h4>
                      <div className="tooltip-traits">
                        {details.traits.map((trait) => (
                          <span key={trait} className="trait-tag">
                            ✨ {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
