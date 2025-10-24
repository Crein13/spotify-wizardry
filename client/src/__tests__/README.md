# Client Test Suite

This directory contains unit and integration tests for the Spotify Wizardry React client application.

## Test Coverage

The test suite covers the following areas:

### 1. Initial Render (4 tests)
- App title rendering
- Login button visibility
- Time range selector hidden when not authenticated
- Sort button hidden when not authenticated

### 2. Authentication Flow (4 tests)
- Access token fetching on successful OAuth callback
- Welcome message display after login
- Redirect to login on authentication failure
- Query parameter cleanup after processing

### 3. Time Range Selector (4 tests)
- All three time range buttons render correctly
- Default selection ("All Time")
- Time range change on button click
- Wrapped data fetching for selected range

### 4. House Sorting (11 tests)
- Sort button rendering and accessibility
- Loading state indication
- API call with correct parameters
- House information display (name, description, traits, etc.)
- Match score display
- Music personality display
- Famous musicians list
- Genres display
- Error handling with user feedback

### 5. Wrapped Data Display (5 tests)
- Section title rendering
- Top tracks display with Spotify links
- Top artists display with genres
- Artist links with proper attributes
- Time range-specific data fetching

### 6. Accessibility (2+ tests)
- Proper aria-labels on interactive elements
- Aria-pressed states on toggle buttons
- Keyboard navigation support
- External links with security attributes

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage

# Run tests with verbose output
npm test -- --verbose
```

## Test Framework

- **React Testing Library** - Component testing utilities
- **Jest** - Test runner and assertion library
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom DOM matchers

## Key Testing Patterns

### Mocking Fetch API

All API calls are mocked using `global.fetch = jest.fn()`:

```typescript
(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ accessToken: 'test-token' }),
});
```

### Async State Testing

Use `waitFor` for asynchronous state updates:

```typescript
await waitFor(() => {
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
}, { timeout: 2000 });
```

### User Interactions

Use `fireEvent` for simple interactions:

```typescript
fireEvent.click(screen.getByText('Button Text'));
```

### Accessibility Testing

Check for proper ARIA attributes:

```typescript
expect(button).toHaveAttribute('aria-pressed', 'true');
expect(element).toHaveAttribute('aria-label', 'Description');
```

## Test Organization

Tests are organized by feature/functionality:

1. **Initial Render** - Static content and unauthenticated state
2. **Authentication** - OAuth flow and token management
3. **Time Range Selector** - User-controlled time period filtering
4. **House Sorting** - Main feature: genre analysis and house assignment
5. **Wrapped Data** - Spotify top tracks/artists display
6. **Accessibility** - ARIA attributes, keyboard navigation, semantic HTML

## Mocked Data Examples

### Mock House Info
```typescript
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
```

### Mock Wrapped Data
```typescript
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
```

## Adding New Tests

When adding new tests:

1. **Group related tests** in describe blocks
2. **Use descriptive test names** that explain what is being tested
3. **Mock external dependencies** (fetch, localStorage, etc.)
4. **Clean up after each test** using `beforeEach`/`afterEach`
5. **Test both success and failure cases**
6. **Verify accessibility** for interactive elements

Example template:

```typescript
describe('New Feature', () => {
  beforeEach(() => {
    // Setup mocks and initial state
  });

  it('should do expected behavior', async () => {
    // Arrange: set up test data
    // Act: trigger the behavior
    // Assert: verify the outcome
  });
});
```

## Best Practices

1. **Test user behavior, not implementation details**
   - ✅ `screen.getByText('Login')`
   - ❌ `wrapper.find('.login-button')`

2. **Use semantic queries**
   - Prefer `getByRole`, `getByLabelText`, `getByText`
   - Avoid `getByTestId` unless necessary

3. **Wait for async updates**
   - Always use `waitFor` for state changes
   - Set appropriate timeouts for slow operations

4. **Mock external dependencies**
   - Mock `fetch` for API calls
   - Mock browser APIs (`window.location`, `localStorage`)
   - Keep mocks simple and focused

5. **Test accessibility**
   - Verify ARIA attributes
   - Check keyboard navigation
   - Ensure screen reader compatibility

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Run tests
  run: npm test -- --coverage --watchAll=false
```

## Troubleshooting

### Tests timing out
- Increase `waitFor` timeout: `waitFor(() => {...}, { timeout: 5000 })`
- Check if async operations complete
- Verify mocks resolve/reject properly

### Elements not found
- Use `screen.debug()` to see current DOM
- Check if element is rendered conditionally
- Verify correct query method (getBy vs queryBy vs findBy)

### Mock not working
- Clear mocks in `beforeEach`: `jest.clearAllMocks()`
- Verify mock is defined before component render
- Check mock call order for sequential responses

## Future Enhancements

Potential additions to the test suite:

- Component-level unit tests (extract reusable components)
- E2E tests with Cypress or Playwright
- Visual regression tests
- Performance benchmarks
- Snapshot tests for complex UI states
