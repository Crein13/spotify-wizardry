# Client Testing Documentation

## Overview

The Spotify Wizardry client includes a comprehensive test suite built with React Testing Library and Jest.

## Test Statistics

- **Total Tests**: 30+
- **Test Categories**: 6
- **Coverage**: Component rendering, user interactions, API calls, state management, accessibility

## Test Categories

### 1. Initial Render (4 tests)
Tests the initial application state before authentication.

### 2. Authentication Flow (4 tests)
Tests OAuth callback handling, token retrieval, and error scenarios.

### 3. Time Range Selector (4 tests)
Tests the time period selector UI and data fetching.

### 4. House Sorting (11 tests)
Tests the core feature: sorting users into music houses based on genres.

### 5. Wrapped Data Display (5 tests)
Tests Spotify top tracks and artists display with proper links.

### 6. Accessibility (2 tests)
Tests ARIA attributes, keyboard navigation, and semantic HTML.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage report
npm test -- --coverage

# Run verbose output
npm test -- --verbose
```

## Test Coverage Areas

### Component Rendering
- ✅ App title and branding
- ✅ Login/authenticated states
- ✅ Time range selector
- ✅ House sorting button
- ✅ House information display
- ✅ Wrapped data sections

### User Interactions
- ✅ Login button click
- ✅ Time range selection
- ✅ House sorting trigger
- ✅ Info icon tooltips
- ✅ Keyboard navigation

### API Integration
- ✅ Token fetching
- ✅ House sorting API calls
- ✅ Wrapped data fetching
- ✅ Error handling
- ✅ Loading states

### State Management
- ✅ Access token state
- ✅ House info state
- ✅ Wrapped data state
- ✅ Time range state
- ✅ Loading/error states

### Accessibility
- ✅ ARIA labels and roles
- ✅ Keyboard focus management
- ✅ Screen reader support
- ✅ Semantic HTML

## Key Features Tested

### Authentication
- OAuth callback processing
- Token storage and retrieval
- Authentication error handling
- Redirect flows

### House Sorting
- Genre analysis trigger
- Match score display
- House information rendering
- Traits and musicians display
- Compatibility visualization

### Time Ranges
- Short term (Last 4 Weeks)
- Medium term (Last 6 Months)
- Long term (All Time)
- Data fetching per range

### Wrapped Data
- Top tracks with Spotify links
- Top artists with genres
- Artist/track information
- External link security

## Test Framework

- **React Testing Library** - Component testing with user-centric queries
- **Jest** - Test runner, mocking, and assertions
- **@testing-library/user-event** - Realistic user interaction simulation
- **@testing-library/jest-dom** - Extended DOM matchers

## Best Practices Followed

1. **User-centric testing** - Tests focus on user behavior, not implementation
2. **Accessibility-first** - Queries use semantic roles and labels
3. **Async handling** - Proper use of `waitFor` for state updates
4. **Mock isolation** - External dependencies (fetch, browser APIs) are mocked
5. **Descriptive names** - Tests clearly describe expected behavior

## Continuous Integration

Tests are designed to run in CI/CD:

```bash
# CI command (non-interactive)
npm test -- --coverage --watchAll=false
```

## Next Steps

Future testing enhancements:

- [ ] Component-level unit tests for extracted components
- [ ] E2E tests with Playwright
- [ ] Visual regression tests
- [ ] Performance benchmarks
- [ ] Snapshot tests for complex UI

## Documentation

See `src/__tests__/README.md` for detailed test documentation, patterns, and examples.
