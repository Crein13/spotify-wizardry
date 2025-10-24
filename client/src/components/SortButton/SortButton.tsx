import React from 'react';
import './SortButton.css';

interface SortButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

export const SortButton: React.FC<SortButtonProps> = ({ onClick, loading, disabled = false }) => {
  return (
    <button
      className="sort-button"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Sorting into your house...' : 'Sort me into my house!'}
    </button>
  );
};
