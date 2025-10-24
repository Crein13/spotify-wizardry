import React from 'react';
import { WrappedData } from '../../types/api';
import './WrappedSection.css';

interface WrappedSectionProps {
  wrappedData: WrappedData;
  loading: boolean;
  timeRangeLabel: string;
}

export const WrappedSection: React.FC<WrappedSectionProps> = ({ wrappedData, loading, timeRangeLabel }) => {
  return (
    <section className="wrapped-section">
      <h2>Your Spotify Wrapped</h2>
      <h3>{timeRangeLabel}</h3>
      <div>
        <h4>Top Tracks</h4>
        <div className="wrapped-grid">
          {loading
            ? Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="card track-card skeleton">
                  <div className="cover shimmer" />
                  <div className="card-text">
                    <div className="title shimmer" />
                    <div className="subtitle shimmer" />
                  </div>
                </div>
              ))
            : (wrappedData.tracks || []).map((track) => (
                <a
                  key={track.name + track.url}
                  href={track.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card track-card"
                  aria-label={`Open ${track.name} on Spotify`}
                >
                  <div className="cover">
                    {track.cover ? (
                      <img src={track.cover} alt={track.name} loading="lazy" />
                    ) : (
                      <div className="cover-fallback shimmer" />
                    )}
                  </div>
                  <div className="card-text">
                    <div className="title">{track.name}</div>
                    <div className="subtitle">{(track.artistNames || []).join(', ')}</div>
                  </div>
                </a>
              ))}
        </div>
      </div>
      <div>
        <h4>Top Artists</h4>
        <div className="wrapped-grid">
          {loading
            ? Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="card artist-card skeleton">
                  <div className="cover shimmer" />
                  <div className="card-text">
                    <div className="title shimmer" />
                    <div className="subtitle shimmer" />
                  </div>
                </div>
              ))
            : (wrappedData.artists || []).map((artist) => (
                <a
                  key={artist.name + artist.url}
                  href={artist.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card artist-card"
                  aria-label={`Open ${artist.name} on Spotify`}
                >
                  <div className="cover">
                    {artist.image ? (
                      <img src={artist.image} alt={artist.name} loading="lazy" />
                    ) : (
                      <div className="cover-fallback shimmer" />
                    )}
                  </div>
                  <div className="card-text">
                    <div className="title">{artist.name}</div>
                    <div className="subtitle">{(artist.genres || []).join(', ')}</div>
                  </div>
                </a>
              ))}
        </div>
      </div>
    </section>
  );
};
