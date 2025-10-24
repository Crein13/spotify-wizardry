import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock fetch globally
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();

    // Mock window.location
    delete (window as any).location;
    window.location = {
      search: '',
      pathname: '/',
      href: '',
      replace: jest.fn(),
    } as any;

    // Mock window.history
    window.history.replaceState = jest.fn();
  });

  describe('Initial Render', () => {
    it('should render the app title', () => {
      render(<App />);
      expect(screen.getByText('Spotify Wizardry')).toBeInTheDocument();
    });

    it('should show login button when not authenticated', () => {
      render(<App />);
      const loginLink = screen.getByText('Login with Spotify');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', expect.stringContaining('/auth/spotify'));
    });

    it('should not show time range selector when not logged in', () => {
      render(<App />);
      expect(screen.queryByText('Last 4 Weeks')).not.toBeInTheDocument();
    });

    it('should not show sort button when not logged in', () => {
      render(<App />);
      expect(screen.queryByText('Sort My House!')).not.toBeInTheDocument();
    });
  });

  describe('Authentication Flow', () => {
    it('should fetch access token when loggedin param is present', async () => {
      window.location.search = '?loggedin=true';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: 'test-token-123' }),
      });

      render(<App />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/spotify/token'),
          expect.objectContaining({
            credentials: 'include',
          })
        );
      }, { timeout: 2000 });
    });

    it('should display logout button after successful login', async () => {
      window.location.search = '?loggedin=true';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: 'test-token-123' }),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Logout')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should redirect to login on authentication failure', async () => {
      window.location.search = '?loggedin=true';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Not authenticated' }),
      });

      render(<App />);

      await waitFor(() => {
        expect(window.location.href).toContain('/auth/spotify');
      }, { timeout: 2000 });
    });

    it('should remove loggedin query param after processing', async () => {
      window.location.search = '?loggedin=true';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: 'test-token-123' }),
      });

      render(<App />);

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Time Range Selector', () => {
    it('should render all three time range buttons', async () => {
      window.location.search = '?loggedin=true';

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: 'test-token-123' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tracks: [], artists: [] }),
        });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Logout')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Last 4 Weeks')).toBeInTheDocument();
      expect(screen.getByText('Last 6 Months')).toBeInTheDocument();
      expect(screen.getByText('All Time')).toBeInTheDocument();
    });

    it('should have "All Time" selected by default', async () => {
      window.location.search = '?loggedin=true';

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: 'test-token-123' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tracks: [], artists: [] }),
        });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Logout')).toBeInTheDocument();
      }, { timeout: 3000 });

      const allTimeButton = screen.getByText('All Time');
      expect(allTimeButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should change selected time range when clicked', async () => {
      window.location.search = '?loggedin=true';

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: 'test-token-123' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tracks: [], artists: [] }),
        });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Logout')).toBeInTheDocument();
      }, { timeout: 3000 });

      const shortTermButton = screen.getByText('Last 4 Weeks');

      fireEvent.click(shortTermButton);

      expect(shortTermButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should fetch wrapped data for selected time range', async () => {
      window.location.search = '?loggedin=true';

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: 'test-token-123' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tracks: [], artists: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tracks: [], artists: [] }),
        });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Logout')).toBeInTheDocument();
      }, { timeout: 3000 });

      const mediumTermButton = screen.getByText('Last 6 Months');

      fireEvent.click(mediumTermButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('time_range=medium_term'),
          expect.any(Object)
        );
      });
    });
  });

  describe('House Sorting', () => {
    const mockHouseInfo = {
      house: 'Auralis',
      description: 'The House of Energy and Innovation',
      traits: ['Energetic', 'Bold', 'Trendsetting'],
      musicPersonality: 'You live for the beat',
      famousMusicians: ['Lady Gaga', 'The Weeknd'],
      matchScore: 85,
      housePercentages: { Auralis: 85, Nocturne: 10, Virtuo: 5, Folklore: 0 },
      normalizedPercentages: { Auralis: 85, Nocturne: 10, Virtuo: 5, Folklore: 0 },
      compatibility: { Auralis: 100, Nocturne: 30, Virtuo: 15, Folklore: 5 },
      rawScores: { Auralis: 17, Nocturne: 2, Virtuo: 1, Folklore: 0 },
      genres: ['edm', 'pop', 'dance'],
    };

    beforeEach(async () => {
      window.location.search = '?loggedin=true';

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: 'test-token-123' }),
        })
        .mockResolvedValue({
          ok: true,
          json: async () => ({ tracks: [], artists: [] }),
        });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Logout')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should render Sort My House button', () => {
      expect(screen.getByText('Sort My House!')).toBeInTheDocument();
    });

    it('should have accessible aria-label on sort button', () => {
      const sortButton = screen.getByLabelText('Sort my house');
      expect(sortButton).toBeInTheDocument();
    });

    it('should show sorting indicator when loading', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => mockHouseInfo,
        }), 100))
      );

      const sortButton = screen.getByText('Sort My House!');
      fireEvent.click(sortButton);

      expect(screen.getByText('Sorting...')).toBeInTheDocument();
    });

    it('should call genres API with correct parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHouseInfo,
      });

      const sortButton = screen.getByText('Sort My House!');
      fireEvent.click(sortButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/spotify/genres'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('test-token-123'),
          })
        );
      });
    });

    it('should display house information after sorting', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHouseInfo,
      });

      const sortButton = screen.getByText('Sort My House!');
      fireEvent.click(sortButton);

      await waitFor(() => {
        expect(screen.getByText('Welcome to House Auralis!')).toBeInTheDocument();
      });
    });

    it('should display match score', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHouseInfo,
      });

      fireEvent.click(screen.getByText('Sort My House!'));

      await waitFor(() => {
        expect(screen.getByText(/Match Score:/)).toBeInTheDocument();
        const matchScoreElements = screen.getAllByText(/85%/);
        expect(matchScoreElements.length).toBeGreaterThan(0);
      });
    });

    it('should display house description', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHouseInfo,
      });

      fireEvent.click(screen.getByText('Sort My House!'));

      await waitFor(() => {
        expect(screen.getByText(mockHouseInfo.description)).toBeInTheDocument();
      });
    });

    it('should display house traits as badges', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHouseInfo,
      });

      fireEvent.click(screen.getByText('Sort My House!'));

      await waitFor(() => {
        expect(screen.getByText('Energetic')).toBeInTheDocument();
        expect(screen.getByText('Bold')).toBeInTheDocument();
        expect(screen.getByText('Trendsetting')).toBeInTheDocument();
      });
    });

    it('should display music personality', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHouseInfo,
      });

      fireEvent.click(screen.getByText('Sort My House!'));

      await waitFor(() => {
        expect(screen.getByText(mockHouseInfo.musicPersonality)).toBeInTheDocument();
      });
    });

    it('should display famous musicians', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHouseInfo,
      });

      fireEvent.click(screen.getByText('Sort My House!'));

      await waitFor(() => {
        expect(screen.getByText(/Lady Gaga • The Weeknd/)).toBeInTheDocument();
      });
    });

    it('should display genres', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHouseInfo,
      });

      fireEvent.click(screen.getByText('Sort My House!'));

      await waitFor(() => {
        expect(screen.getByText(/edm, pop, dance/)).toBeInTheDocument();
      });
    });

    it('should show alert on error', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      fireEvent.click(screen.getByText('Sort My House!'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error analyzing your music taste');
      });

      alertSpy.mockRestore();
    });
  });

  describe('Wrapped Data Display', () => {
    const mockWrappedData = {
      tracks: [
        {
          name: 'Test Track 1',
          artists: [{ name: 'Test Artist 1' }],
          external_urls: { spotify: 'https://spotify.com/track1' },
        },
      ],
      artists: [
        {
          name: 'Test Artist 1',
          genres: ['pop', 'rock'],
          external_urls: { spotify: 'https://spotify.com/artist1' },
        },
      ],
    };

    beforeEach(async () => {
      window.location.search = '?loggedin=true';

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: 'test-token-123' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWrappedData,
        });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Logout')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should display wrapped section title', () => {
      expect(screen.getByText('Your Spotify Wrapped')).toBeInTheDocument();
    });

    it('should display top tracks section', async () => {
      await waitFor(() => {
        expect(screen.getByText('Top Tracks')).toBeInTheDocument();
      });
    });

    it('should display track names as links', async () => {
      await waitFor(() => {
        const track1Link = screen.getByText('Test Track 1');
        expect(track1Link).toHaveAttribute('href', 'https://spotify.com/track1');
        expect(track1Link).toHaveAttribute('target', '_blank');
      });
    });

    it('should display top artists section', async () => {
      await waitFor(() => {
        expect(screen.getByText('Top Artists')).toBeInTheDocument();
      });
    });

    it('should display artist names as links', async () => {
      await waitFor(() => {
        const artist1Link = screen.getByText('Test Artist 1');
        expect(artist1Link).toHaveAttribute('href', 'https://spotify.com/artist1');
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      window.location.search = '?loggedin=true';

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: 'test-token-123' }),
        })
        .mockResolvedValue({
          ok: true,
          json: async () => ({ tracks: [], artists: [] }),
        });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Logout')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should have proper aria-labels on buttons', () => {
      expect(screen.getByLabelText('Sort my house')).toBeInTheDocument();
    });

    it('should have proper aria-pressed on time range buttons', () => {
      const allTimeButton = screen.getByText('All Time');
      expect(allTimeButton).toHaveAttribute('aria-pressed', 'true');

      const shortTermButton = screen.getByText('Last 4 Weeks');
      expect(shortTermButton).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
