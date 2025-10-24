import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ emoji, title, message }) => {
  return (
    <div className="empty-state">
      <div className="empty-emoji" aria-hidden="true">
        {emoji}
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-text">{message}</p>
    </div>
  );
};
