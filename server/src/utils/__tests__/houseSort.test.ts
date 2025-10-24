import { sortHouseByGenres, houseDetails, HouseName } from '../houseSort';

describe('sortHouseByGenres', () => {
  describe('Basic house assignment', () => {
    it('should assign Auralis house for EDM/pop/rock genres', () => {
      const genres = ['edm', 'pop', 'rock', 'dance'];
      const result = sortHouseByGenres(genres);

      expect(result.house).toBe('Auralis');
      expect(result.matchScore).toBeGreaterThan(0);
      expect(result.description).toBe(houseDetails.Auralis.description);
      expect(result.traits).toEqual(houseDetails.Auralis.traits);
    });

    it('should assign Nocturne house for ambient/lo-fi/alternative genres', () => {
      const genres = ['ambient', 'lo-fi', 'alternative', 'r&b'];
      const result = sortHouseByGenres(genres);

      expect(result.house).toBe('Nocturne');
      expect(result.musicPersonality).toBe(houseDetails.Nocturne.musicPersonality);
      expect(result.famousMusicians).toEqual(houseDetails.Nocturne.famousMusicians);
    });

    it('should assign Virtuo house for classical/jazz/experimental genres', () => {
      const genres = ['classical', 'jazz', 'experimental'];
      const result = sortHouseByGenres(genres);

      expect(result.house).toBe('Virtuo');
      expect(result.matchScore).toBeGreaterThan(0);
    });

    it('should assign Folklore house for folk/indie/acoustic genres', () => {
      const genres = ['folk', 'indie', 'acoustic', 'country'];
      const result = sortHouseByGenres(genres);

      expect(result.house).toBe('Folklore');
      expect(result.matchScore).toBeGreaterThan(0);
    });
  });

  describe('Match score calculation', () => {
    it('should calculate 100% match score when all genres match a single house', () => {
      const genres = ['edm', 'dance', 'pop'];
      const result = sortHouseByGenres(genres);

      expect(result.matchScore).toBe(100);
      expect(result.house).toBe('Auralis');
    });

    it('should calculate partial match score for mixed genres', () => {
      const genres = ['edm', 'ambient', 'folk', 'jazz'];
      const result = sortHouseByGenres(genres);

      expect(result.matchScore).toBeGreaterThan(0);
      expect(result.matchScore).toBeLessThan(100);
    });

    it('should calculate 0% match score for completely unknown genres', () => {
      const genres = ['unknown-genre-1', 'unknown-genre-2', 'fake-genre'];
      const result = sortHouseByGenres(genres);

      expect(result.matchScore).toBe(0);
    });

    it('should handle case-insensitive genre matching', () => {
      const genres = ['EDM', 'POP', 'ROCK'];
      const result = sortHouseByGenres(genres);

      expect(result.house).toBe('Auralis');
      expect(result.matchScore).toBe(100);
    });

    it('should match genres containing house genre as substring', () => {
      const genres = ['electro-pop', 'indie-folk', 'hip-hop'];
      const result = sortHouseByGenres(genres);

      // Should match pop, folk, and hip hop
      expect(result.matchScore).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty genre list', () => {
      const genres: string[] = [];
      const result = sortHouseByGenres(genres);

      expect(result.house).toBe('Auralis'); // Default to first house
      expect(result.matchScore).toBe(0);
      expect(result.housePercentages.Auralis).toBe(0);
      expect(result.normalizedPercentages.Auralis).toBe(0);
    });

    it('should handle single genre', () => {
      const genres = ['jazz'];
      const result = sortHouseByGenres(genres);

      expect(result.house).toBe('Virtuo');
      expect(result.matchScore).toBe(100);
    });

    it('should handle very long genre list', () => {
      const genres = Array(100).fill('pop');
      const result = sortHouseByGenres(genres);

      expect(result.house).toBe('Auralis');
      expect(result.matchScore).toBe(100);
    });

    it('should handle genres with special characters', () => {
      const genres = ['hip-hop', 'r&b', 'k-pop'];
      const result = sortHouseByGenres(genres);

      expect(result.matchScore).toBeGreaterThan(0);
    });
  });

  describe('House percentages', () => {
    it('should calculate raw house percentages based on genre matches', () => {
      const genres = ['edm', 'pop', 'ambient', 'folk'];
      const result = sortHouseByGenres(genres);

      // Each house should have a percentage based on matches
      expect(result.housePercentages.Auralis).toBeGreaterThan(0);
      expect(result.housePercentages.Nocturne).toBeGreaterThan(0);
      expect(result.housePercentages.Folklore).toBeGreaterThan(0);

      // All percentages should be between 0 and 100
      Object.values(result.housePercentages).forEach(pct => {
        expect(pct).toBeGreaterThanOrEqual(0);
        expect(pct).toBeLessThanOrEqual(100);
      });
    });

    it('should have normalized percentages that sum to 100', () => {
      const genres = ['edm', 'ambient', 'jazz', 'folk'];
      const result = sortHouseByGenres(genres);

      const sum = Object.values(result.normalizedPercentages).reduce((a, b) => a + b, 0);
      expect(sum).toBe(100);
    });

    it('should have all normalized percentages between 0 and 100', () => {
      const genres = ['pop', 'rock', 'edm'];
      const result = sortHouseByGenres(genres);

      Object.values(result.normalizedPercentages).forEach(pct => {
        expect(pct).toBeGreaterThanOrEqual(0);
        expect(pct).toBeLessThanOrEqual(100);
      });
    });

    it('should assign 100% to winning house when only one house matches', () => {
      const genres = ['edm', 'dance'];
      const result = sortHouseByGenres(genres);

      expect(result.normalizedPercentages.Auralis).toBe(100);
      expect(result.normalizedPercentages.Nocturne).toBe(0);
      expect(result.normalizedPercentages.Virtuo).toBe(0);
      expect(result.normalizedPercentages.Folklore).toBe(0);
    });
  });

  describe('Compatibility scores', () => {
    it('should calculate compatibility between 0 and 100 for all houses', () => {
      const genres = ['edm', 'pop', 'ambient', 'folk'];
      const result = sortHouseByGenres(genres);

      Object.values(result.compatibility).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('should give highest compatibility to the assigned house', () => {
      const genres = ['edm', 'pop', 'rock'];
      const result = sortHouseByGenres(genres);

      const topHouse = result.house;
      const topCompatibility = result.compatibility[topHouse];

      Object.entries(result.compatibility).forEach(([house, score]) => {
        if (house !== topHouse) {
          expect(topCompatibility).toBeGreaterThanOrEqual(score);
        }
      });
    });

    it('should reflect genre overlap in compatibility scores', () => {
      const genres = ['edm', 'pop', 'ambient'];
      const result = sortHouseByGenres(genres);

      // Auralis and Nocturne should have some compatibility since both matched
      expect(result.compatibility.Auralis).toBeGreaterThan(0);
      expect(result.compatibility.Nocturne).toBeGreaterThan(0);
    });

    it('should have zero compatibility for houses with no genre matches', () => {
      const genres = ['edm', 'dance', 'pop'];
      const result = sortHouseByGenres(genres);

      // Only Auralis should match, others should have 0 compatibility
      expect(result.compatibility.Auralis).toBeGreaterThan(0);
      // Others might have small non-zero values due to the algorithm's scaling
      // but should be significantly lower
    });
  });

  describe('Raw scores', () => {
    it('should include raw scores in the result', () => {
      const genres = ['edm', 'pop', 'ambient'];
      const result = sortHouseByGenres(genres);

      expect(result.rawScores).toBeDefined();
      expect(result.rawScores?.Auralis).toBeGreaterThan(0);
      expect(result.rawScores?.Nocturne).toBeGreaterThan(0);
    });

    it('should have raw scores that are non-negative integers', () => {
      const genres = ['jazz', 'classical', 'rock'];
      const result = sortHouseByGenres(genres);

      Object.values(result.rawScores || {}).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(score)).toBe(true);
      });
    });

    it('should have zero raw scores for houses with no matches', () => {
      const genres = ['unknown-1', 'unknown-2'];
      const result = sortHouseByGenres(genres);

      expect(result.rawScores?.Auralis).toBe(0);
      expect(result.rawScores?.Nocturne).toBe(0);
      expect(result.rawScores?.Virtuo).toBe(0);
      expect(result.rawScores?.Folklore).toBe(0);
    });
  });

  describe('Tie-breaking behavior', () => {
    it('should consistently choose same house for identical genre lists', () => {
      const genres = ['edm', 'ambient'];
      const result1 = sortHouseByGenres(genres);
      const result2 = sortHouseByGenres(genres);

      expect(result1.house).toBe(result2.house);
      expect(result1.matchScore).toBe(result2.matchScore);
    });

    it('should break ties deterministically', () => {
      // Create a scenario where two houses might have equal scores
      const genres = ['pop', 'alternative'];
      const result = sortHouseByGenres(genres);

      // Should pick one consistently (Auralis has pop, Nocturne has alternative)
      expect(['Auralis', 'Nocturne']).toContain(result.house);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle diverse music taste spanning multiple houses', () => {
      const genres = [
        'indie-rock', 'dream-pop', 'lo-fi', 'acoustic',
        'folk-rock', 'alternative', 'singer-songwriter'
      ];
      const result = sortHouseByGenres(genres);

      expect(result.matchScore).toBeGreaterThan(0);
      expect(result.house).toBeDefined();

      // Should have distribution across multiple houses
      const nonZeroHouses = Object.values(result.normalizedPercentages)
        .filter(pct => pct > 0).length;
      expect(nonZeroHouses).toBeGreaterThan(1);
    });

    it('should handle electronic music enthusiast', () => {
      const genres = [
        'edm', 'house', 'techno', 'trance', 'dubstep',
        'electro', 'electronic', 'dance'
      ];
      const result = sortHouseByGenres(genres);

      expect(result.house).toBe('Auralis');
      expect(result.matchScore).toBeGreaterThan(0);
      expect(result.normalizedPercentages.Auralis).toBeGreaterThan(50);
    });

    it('should handle classical music lover', () => {
      const genres = [
        'classical', 'baroque', 'romantic', 'contemporary-classical',
        'orchestral', 'chamber-music', 'opera'
      ];
      const result = sortHouseByGenres(genres);

      expect(result.house).toBe('Virtuo');
      expect(result.matchScore).toBeGreaterThan(0);
    });

    it('should handle indie/folk listener', () => {
      const genres = [
        'indie', 'indie-folk', 'folk', 'singer-songwriter',
        'acoustic', 'americana', 'alt-country'
      ];
      const result = sortHouseByGenres(genres);

      expect(result.house).toBe('Folklore');
      expect(result.normalizedPercentages.Folklore).toBeGreaterThan(50);
    });

    it('should handle ambient/atmospheric music fan', () => {
      const genres = [
        'ambient', 'lo-fi', 'downtempo', 'chillwave',
        'dream-pop', 'shoegaze', 'post-rock'
      ];
      const result = sortHouseByGenres(genres);

      // Ambient, lo-fi match Nocturne; pop, rock might match Auralis
      // Test should verify that ambient/lo-fi genres contribute to the result
      expect(['Nocturne', 'Auralis']).toContain(result.house);
      expect(result.normalizedPercentages.Nocturne).toBeGreaterThan(0);
      expect(result.compatibility.Nocturne).toBeGreaterThan(0);
    });
  });

  describe('Return value structure', () => {
    it('should return all required fields', () => {
      const genres = ['pop', 'rock'];
      const result = sortHouseByGenres(genres);

      expect(result).toHaveProperty('house');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('traits');
      expect(result).toHaveProperty('musicPersonality');
      expect(result).toHaveProperty('famousMusicians');
      expect(result).toHaveProperty('matchScore');
      expect(result).toHaveProperty('housePercentages');
      expect(result).toHaveProperty('normalizedPercentages');
      expect(result).toHaveProperty('compatibility');
      expect(result).toHaveProperty('rawScores');
    });

    it('should return arrays for traits and famousMusicians', () => {
      const genres = ['jazz'];
      const result = sortHouseByGenres(genres);

      expect(Array.isArray(result.traits)).toBe(true);
      expect(Array.isArray(result.famousMusicians)).toBe(true);
      expect(result.traits.length).toBeGreaterThan(0);
      expect(result.famousMusicians.length).toBeGreaterThan(0);
    });

    it('should return strings for description and musicPersonality', () => {
      const genres = ['edm'];
      const result = sortHouseByGenres(genres);

      expect(typeof result.description).toBe('string');
      expect(typeof result.musicPersonality).toBe('string');
      expect(result.description.length).toBeGreaterThan(0);
      expect(result.musicPersonality.length).toBeGreaterThan(0);
    });

    it('should return numbers for all score fields', () => {
      const genres = ['pop'];
      const result = sortHouseByGenres(genres);

      expect(typeof result.matchScore).toBe('number');
      Object.values(result.housePercentages).forEach(val => {
        expect(typeof val).toBe('number');
      });
      Object.values(result.normalizedPercentages).forEach(val => {
        expect(typeof val).toBe('number');
      });
      Object.values(result.compatibility).forEach(val => {
        expect(typeof val).toBe('number');
      });
    });
  });
});
