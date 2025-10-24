import React from 'react';
import './Navbar.css';

interface NavbarProps {
  accessToken: string | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ accessToken, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <h1 className="nav-title">🎵 Spotify Wizardry</h1>
        {accessToken && (
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};
