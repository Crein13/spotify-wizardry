import React from 'react';
import { HouseName, HouseSortResult, HouseInfo as HouseInfoType } from '../../types/api';
import './HouseInfo.css';

interface HouseInfoProps {
  houseInfo: HouseSortResult;
  genres: string[];
  allHouseDetails: Record<HouseName, HouseInfoType>;
  flash?: boolean;
}

export const HouseInfo: React.FC<HouseInfoProps> = ({
  houseInfo,
  genres,
  allHouseDetails,
  flash = false
}) => {
  const allHouses: HouseName[] = ['Auralis', 'Nocturne', 'Virtuo', 'Folklore'];

  return (
    <div className={`house-info ${flash ? 'flash' : ''}`}>
      <h2>Welcome to House {houseInfo.house}!</h2>

      <div className="match-score">
        <p>
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
          >
            ⓘ
          </span>
        </p>
      </div>

      <div className="house-description">
        <h3>About Your House</h3>
        <p>{houseInfo.description}</p>
      </div>

      <div className="traits">
        <h3>House Traits</h3>
        <div className="traits-list">
          {(houseInfo.traits || []).map((trait) => (
            <span key={trait} className="trait-badge">
              {trait}
            </span>
          ))}
        </div>
      </div>

      <div className="music-personality">
        <h3>Your Music Personality</h3>
        <p>{houseInfo.musicPersonality || ''}</p>
      </div>

      <div className="famous-musicians">
        <h3>Notable House Members</h3>
        <p>
          {(houseInfo.famousMusicians || [])
            .map((m: any) => m.name || m)
            .join(' • ')}
        </p>
      </div>

      <div className="genres">
        <h3>Your Musical Genres</h3>
        <p>{genres.join(', ')}</p>
      </div>

      <div className="other-houses">
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
          >
            ⓘ
          </span>
        </h3>
        <div className="house-list">
          {allHouses
            .filter((h) => {
              const raw = (houseInfo.rawScores as any)?.[h] ?? 0;
              return h === houseInfo.house || raw > 0;
            })
            .map((h) => {
              const pct =
                (houseInfo.normalizedPercentages as any)?.[h] ??
                (houseInfo.housePercentages as any)?.[h] ??
                0;
              const comp = (houseInfo.compatibility as any)?.[h] ?? 0;
              const isTop = h === houseInfo.house;

              return (
                <div key={h} className="house-row">
                  <div className="house-row-header">
                    <div className="house-row-title">
                      <strong className={isTop ? 'top-house' : ''}>
                        {h}
                      </strong>
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
                        <div
                          className="tooltip-box"
                          role="dialog"
                          aria-label={`${h} details`}
                        >
                          <div className="tooltip-text">
                            {allHouseDetails?.[h]?.musicPersonality || ''}
                          </div>
                          {allHouseDetails?.[h]?.famousMusicians?.length ? (
                            <div className="tooltip-notable">
                              Notable:{' '}
                              {allHouseDetails[h].famousMusicians
                                .slice(0, 3)
                                .map((m: any) => m.name)
                                .join(', ')}
                            </div>
                          ) : null}
                          {allHouseDetails?.[h]?.famousMusicians?.length ? (
                            <div
                              className="tooltip-artists"
                              aria-label="Famous artists from this house"
                            >
                              {allHouseDetails[h].famousMusicians
                                .slice(0, 3)
                                .map((musician: any, idx: number) => (
                                  <a
                                    key={musician.name + idx}
                                    href={musician.spotifyUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={musician.name}
                                    className="artist-thumb famous-artist"
                                  >
                                    {musician.image ? (
                                      <img
                                        loading="lazy"
                                        src={musician.image}
                                        alt={musician.name}
                                      />
                                    ) : (
                                      <span className="artist-fallback">
                                        {musician.name.charAt(0)}
                                      </span>
                                    )}
                                  </a>
                                ))}
                            </div>
                          ) : null}
                        </div>
                      </span>
                    </div>
                    <span className="percentage">{pct}%</span>
                  </div>
                  <div className="percent-bar">
                    <div
                      className="percent-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: isTop ? '#61dafb' : '#444',
                      }}
                    />
                  </div>
                  <div className="compatibility-row">
                    <small className="compatibility-label">Compatibility</small>
                    <small className="compatibility-value">{comp}%</small>
                  </div>
                  <div className="compat-bar">
                    <div
                      className="compat-bar-fill"
                      style={{ width: `${comp}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
