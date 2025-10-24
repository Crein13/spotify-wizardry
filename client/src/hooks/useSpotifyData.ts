import { useState, useEffect } from 'react';
import type { GenresApiResponse, TopArtist, HouseName, HouseInfo as ApiHouseInfo, HouseSortResult } from '../types/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export function useSpotifyData(accessToken: string | null) {
  const [genres, setGenres] = useState<string[]>([]);
  const [houseInfo, setHouseInfo] = useState<HouseSortResult | null>(null);
  const [topArtists, setTopArtists] = useState<TopArtist[]>([]);
  const [allHouseDetails, setAllHouseDetails] = useState<Record<HouseName, ApiHouseInfo> | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch house details when user logs in
  useEffect(() => {
    const fetchHouseDetails = async () => {
      try {
        // Try to fetch house details with images if authenticated
        if (accessToken) {
          const res = await fetch(`${BACKEND_URL}/api/spotify/houses`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          if (res.ok) {
            const data = await res.json();
            setAllHouseDetails(data.allHouseDetails || null);
            return;
          }
        }

        // Fallback to basic house details (no images, no auth required)
        const res = await fetch(`${BACKEND_URL}/api/spotify/houses/basic`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          setAllHouseDetails(data.allHouseDetails || null);
        }
      } catch (err) {
        console.error('Error fetching house details:', err);
      }
    };

    fetchHouseDetails();
  }, [accessToken]);

  const fetchGenres = async (timeRange: string) => {
    if (!accessToken) return;
    setLoading(true);

    try {
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

      let data: GenresApiResponse | null = null;
      let lastError: any = null;

      // Retry up to 3 times with exponential backoff
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
      setHouseInfo(data);
    } catch (err) {
      console.error('Error fetching genres:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearHouseInfo = () => {
    setHouseInfo(null);
    setGenres([]);
  };

  return { genres, houseInfo, topArtists, allHouseDetails, loading, fetchGenres, clearHouseInfo };
}
