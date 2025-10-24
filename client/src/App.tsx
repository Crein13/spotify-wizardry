import React from 'react';
import './App.css';
import { ToastContainer } from './components/Toast/Toast';
import { Navbar } from './components/Navbar/Navbar';
import { LoginPage } from './components/LoginPage/LoginPage';
import { TimeRangeSelector } from './components/TimeRangeSelector/TimeRangeSelector';
import { SortButton } from './components/SortButton/SortButton';
import { HouseBadge } from './components/HouseBadge/HouseBadge';
import { HouseInfo } from './components/HouseInfo/HouseInfo';
import { EmptyState } from './components/EmptyState/EmptyState';
import { WrappedSection } from './components/WrappedSection/WrappedSection';
import { useToast } from './hooks/useToast';
import { useAuth } from './hooks/useAuth';
import { useSpotifyData } from './hooks/useSpotifyData';
import { fetchWrapped, logout } from './utils/api';

function App() {
  const { accessToken, setAccessToken } = useAuth();
  const { toasts, showToast } = useToast();
  const timeRanges = [
    { key: 'short_term', label: 'Last 4 Weeks' },
    { key: 'medium_term', label: 'Last 6 Months' },
    { key: 'long_term', label: 'All Time' }
  ];
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('long_term');
  const [sortedTimeRange, setSortedTimeRange] = React.useState<string | null>(null);
  const [hatTilt, setHatTilt] = React.useState(false);
  const [houseFlash, setHouseFlash] = React.useState(false);
  const [wrappedData, setWrappedData] = React.useState<Record<string, any>>({});
  const [wrappedLoading, setWrappedLoading] = React.useState<Record<string, boolean>>({});
  const {
    genres,
    houseInfo,
    topArtists,
    allHouseDetails,
    loading,
    fetchGenres,
    clearHouseInfo
  } = useSpotifyData(accessToken);

  // Fetch wrapped data and genres for the selected time range when logged in or when the range changes
  React.useEffect(() => {
    if (accessToken) {
      fetchWrappedData(selectedTimeRange);
    }
  }, [accessToken, selectedTimeRange]);

  const fetchWrappedData = async (timeRange: string) => {
    if (!accessToken) return;
    setWrappedLoading((prev) => ({ ...prev, [timeRange]: true }));
    try {
      const raw = await fetchWrapped(accessToken, timeRange);
      // Normalize server response to include image URLs for UI
      const normalized = {
        tracks: Array.isArray(raw.tracks)
          ? raw.tracks.map((t: any) => ({
              name: t?.name || 'Unknown Track',
              artistNames: Array.isArray(t?.artists) ? t.artists.map((a: any) => a?.name).filter(Boolean) : [],
              url: t?.external_urls?.spotify || '#',
              cover: Array.isArray(t?.album?.images) && t.album.images.length > 0 ? t.album.images[0].url : null,
            }))
          : [],
        artists: Array.isArray(raw.artists)
          ? raw.artists.map((a: any) => ({
              name: a?.name || 'Unknown Artist',
              url: a?.external_urls?.spotify || '#',
              image: Array.isArray(a?.images) && a.images.length > 0 ? a.images[0].url : null,
              genres: Array.isArray(a?.genres) ? a.genres : [],
            }))
          : [],
      };
      setWrappedData((prev) => ({ ...prev, [timeRange]: normalized }));
    } catch (err) {
      // Silently handle error - wrapped data is optional
    } finally {
      setWrappedLoading((prev) => ({ ...prev, [timeRange]: false }));
    }
  };

  const handleTimeRangeChange = (timeRange: string) => {
    setSelectedTimeRange(timeRange);
    setSortedTimeRange(null);
    setHouseFlash(false);
    clearHouseInfo();
  };

  const handleSort = async () => {
    setHatTilt(true);
    setTimeout(() => setHatTilt(false), 600);
    await fetchGenres(selectedTimeRange);
    setSortedTimeRange(selectedTimeRange);
    setHouseFlash(true);
    setTimeout(() => setHouseFlash(false), 800);
  };

  const handleLogout = async () => {
    await logout();
    setAccessToken(null);
    showToast('Logged out!', 'success');
  };

  return (
    <div className="App">
      <ToastContainer toasts={toasts} />
      <Navbar accessToken={accessToken} onLogout={handleLogout} />
      <header className="App-header">
        {!accessToken ? (
          <LoginPage allHouseDetails={allHouseDetails as any} />
        ) : (
          <>
            <TimeRangeSelector
              selectedTimeRange={selectedTimeRange as any}
              onChange={handleTimeRangeChange}
              disabled={loading}
            />
            {sortedTimeRange === selectedTimeRange && houseInfo ? (
              <HouseBadge houseName={houseInfo.house} />
            ) : (
              <SortButton onClick={handleSort} loading={loading} disabled={loading} />
            )}
            {houseInfo ? (
              <HouseInfo
                houseInfo={houseInfo}
                genres={genres}
                allHouseDetails={allHouseDetails as any}
                flash={houseFlash}
              />
            ) : (
              <EmptyState
                emoji="🪄"
                title="Ready for Sorting"
                message="Choose a time range and tap 'Sort My House!' to reveal your magical musical house."
              />
            )}
            <WrappedSection
              wrappedData={wrappedData[selectedTimeRange] || { tracks: [], artists: [] }}
              loading={!!wrappedLoading[selectedTimeRange]}
              timeRangeLabel={timeRanges.find(t => t.key === selectedTimeRange)?.label || ''}
            />
          </>
        )}
      </header>
    </div>
  );
}

export default App;
