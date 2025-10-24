# House Sorting Algorithm Tests

This directory contains comprehensive unit tests for the `sortHouseByGenres` function, which is the core algorithm that assigns users to Harry Potter-themed music houses.

## Test Coverage

**Current Coverage: 100% statements, 92.85% branches, 100% functions**

The test suite includes **35 test cases** organized into the following categories:

### 1. Basic House Assignment (4 tests)
Tests that each house (Auralis, Nocturne, Virtuo, Folklore) can be correctly assigned based on representative genres.

- ✓ Auralis assignment for EDM/pop/rock
- ✓ Nocturne assignment for ambient/lo-fi/alternative
- ✓ Virtuo assignment for classical/jazz/experimental
- ✓ Folklore assignment for folk/indie/acoustic

### 2. Match Score Calculation (5 tests)
Validates the confidence scoring system that indicates how well a user's genres match their assigned house.

- ✓ 100% match score when all genres match a single house
- ✓ Partial match score for mixed genres
- ✓ 0% match score for completely unknown genres
- ✓ Case-insensitive genre matching
- ✓ Substring matching (e.g., "electro-pop" matches "pop")

### 3. Edge Cases (4 tests)
Ensures the algorithm handles unusual inputs gracefully.

- ✓ Empty genre list (returns default house with 0% scores)
- ✓ Single genre
- ✓ Very long genre list (100 items)
- ✓ Genres with special characters (hyphens, ampersands, etc.)

### 4. House Percentages (4 tests)
Validates the raw and normalized percentage calculations.

- ✓ Raw percentages calculated from genre matches
- ✓ Normalized percentages sum to exactly 100
- ✓ All percentages are between 0 and 100
- ✓ 100% assignment when only one house matches

### 5. Compatibility Scores (4 tests)
Tests the inter-house compatibility metric based on genre overlap.

- ✓ All compatibility scores are between 0 and 100
- ✓ Highest compatibility for the assigned house
- ✓ Genre overlap reflected in compatibility scores
- ✓ Zero compatibility for houses with no genre matches

### 6. Raw Scores (3 tests)
Validates the integer count of genre matches per house.

- ✓ Raw scores are included in result
- ✓ Raw scores are non-negative integers
- ✓ Zero raw scores for houses with no matches

### 7. Tie-Breaking Behavior (2 tests)
Ensures deterministic and consistent results.

- ✓ Identical inputs produce identical outputs
- ✓ Ties are broken deterministically

### 8. Real-World Scenarios (5 tests)
Tests realistic genre combinations that users might have.

- ✓ Diverse music taste spanning multiple houses
- ✓ Electronic music enthusiast (EDM, house, techno, trance, etc.)
- ✓ Classical music lover (classical, baroque, romantic, orchestral, etc.)
- ✓ Indie/folk listener (indie-folk, singer-songwriter, acoustic, etc.)
- ✓ Ambient/atmospheric music fan (ambient, lo-fi, dream-pop, etc.)

### 9. Return Value Structure (4 tests)
Validates the shape and types of the returned `HouseSortResult` object.

- ✓ All required fields are present
- ✓ Arrays returned for traits and famousMusicians
- ✓ Strings returned for description and musicPersonality
- ✓ Numbers returned for all score fields

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Framework

- **Jest** - Testing framework
- **ts-jest** - TypeScript support for Jest

## Understanding the Algorithm

The `sortHouseByGenres` algorithm:

1. **Scores each house** by counting how many of the user's genres match each house's representative genres
2. **Selects the top house** with the highest score
3. **Calculates match score** as (matching genres / total genres) × 100
4. **Computes raw percentages** for each house
5. **Normalizes percentages** to sum to exactly 100
6. **Calculates compatibility** between houses using:
   - Genre overlap (Jaccard similarity)
   - House share (normalized percentage)
   - Scaling by match score confidence

## Key Metrics Explained

- **matchScore** (0-100): Confidence in the house assignment
- **housePercentages**: Raw percentage of genres matching each house
- **normalizedPercentages**: Percentages adjusted to sum to 100
- **compatibility**: How similar each house is to the assigned house
- **rawScores**: Integer count of matching genres per house

## Adding New Tests

When adding new tests, consider:

1. **Genre coverage** - Test with genres from each house
2. **Edge cases** - Empty arrays, null values, special characters
3. **Real-world scenarios** - Use actual Spotify genre combinations
4. **Score validation** - Ensure all scores are in valid ranges
5. **Type safety** - Verify return value structure

Example test template:

```typescript
it('should [describe expected behavior]', () => {
  const genres = ['genre1', 'genre2'];
  const result = sortHouseByGenres(genres);

  expect(result.house).toBe('ExpectedHouse');
  expect(result.matchScore).toBeGreaterThan(0);
  // Add more assertions...
});
```

## Known Behavior

- Genre matching is **case-insensitive**
- Substring matching is enabled (e.g., "indie-rock" matches "rock")
- Empty genre list defaults to 'Auralis' with 0% scores
- Ties are broken deterministically (first house in iteration order wins)
- Normalized percentages may have small rounding adjustments to sum to exactly 100

## Future Test Ideas

- Performance tests for very large genre lists (1000+ genres)
- Fuzzy matching tests for similar genre names
- Integration tests with actual Spotify API responses
- Property-based testing with random genre combinations
- Snapshot tests for specific user profiles
