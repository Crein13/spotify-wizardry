import React from 'react';
import './HouseBadge.css';

interface HouseBadgeProps {
  houseName: string;
}

const emojiForHouse = (name: string) => {
  switch (name) {
    case 'Auralis':
      return '🎶';
    case 'Nocturne':
      return '🌙';
    case 'Virtuo':
      return '🎻';
    case 'Folklore':
      return '🪕';
    default:
      return '🏰';
  }
};

export const HouseBadge: React.FC<HouseBadgeProps> = ({ houseName }) => {
  const emoji = emojiForHouse(houseName);
  return (
    <div className="house-badge">
      <span className="house-badge-text">
        {emoji} You have been sorted into <strong>{houseName}</strong>
      </span>
    </div>
  );
};
