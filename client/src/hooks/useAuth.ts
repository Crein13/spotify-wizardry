import { useState, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('loggedin')) {
      setTimeout(() => {
        fetch(`${BACKEND_URL}/api/spotify/token`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
          .then(async (res) => {
            if (!res.ok) throw new Error('Failed to fetch token');
            return res.json();
          })
          .then((data) => {
            if (data.accessToken) {
              setAccessToken(data.accessToken);
            } else {
              window.location.href = `${BACKEND_URL}/auth/spotify`;
            }
          })
          .catch(() => {
            window.location.href = `${BACKEND_URL}/auth/spotify`;
          });
      }, 1000);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return { accessToken, setAccessToken };
}
