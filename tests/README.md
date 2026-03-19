# Testing Documentation

This directory contains all tests for the My Tasks PWA.

## Test Structure

```
tests/
├── unit/
│   └── app.test.js       # Unit tests for core logic
├── e2e/
│   └── app.spec.js       # End-to-end tests with Playwright
└── README.md             # This file
```

## Prerequisites

Install dependencies:

```bash
npm install
```

## Running Tests

### Unit Tests (Jest)

Run all unit tests:
```bash
npm test
```

Run only unit tests:
```bash
npm run test:unit
```

### E2E Tests (Playwright)

First, install Playwright browsers:
```bash
npx playwright install
```

Run e2e tests:
```bash
npm run test:e2e
```

Run e2e tests with UI:
```bash
npx playwright test --ui
```

### Run All Tests

```bash
npm run test:all
```

## Test Coverage

### Unit Tests (`tests/unit/app.test.js`)

- **parseAndClassifyTasks**: Tests bulk import task parsing
  - Parses plain text tasks
  - Removes list markers (-, *, •, 1., [x])
  - Auto-classifies work tasks by keywords
  - Auto-classifies social tasks
  - Auto-classifies later/someday tasks
  - Detects effort levels (low, medium, high)
  - Handles edge cases (empty lines, whitespace)

- **localStorage**: Tests data persistence
  - Save and load tasks
  - Handle corrupted data gracefully
  - Theme persistence
  - Mode persistence

### E2E Tests (`tests/e2e/app.spec.js`)

- **Core Task Flows**:
  - Homepage loads correctly
  - Add new tasks
  - Toggle task completion
  - Delete tasks
  - Filter tasks (all, pending, completed)
  - Tasks persist after page reload

- **PWA Features**:
  - Service worker registration
  - Web app manifest present
  - Theme switching
  - Energy mode switching (normal, deep, low, social)

## Local Development Server

Playwright tests expect the app to be served on `http://localhost:8080`. The config automatically starts a server using:

```bash
python3 -m http.server 8080
```

Alternatively, you can use any other static server:

```bash
# Node.js http-server
npx http-server -p 8080

# Python 2
python -m SimpleHTTPServer 8080
```

## Debugging Tests

### Jest (Unit)

Run with verbose output:
```bash
npm test -- --verbose
```

### Playwright (E2E)

Run in headed mode (see browser):
```bash
npx playwright test --headed
```

Debug mode (pause and step through):
```bash
npx playwright test --debug
```

Generate test report:
```bash
npx playwright show-report
```

## CI/CD Integration

Tests are configured to run in CI environments. The Playwright config automatically:
- Uses 1 worker in CI
- Retries failed tests 2 times
- Starts web server before tests

## Writing New Tests

### Unit Test Template

```javascript
test('description', () => {
  // Arrange
  const input = 'test data';
  
  // Act
  const result = functionUnderTest(input);
  
  // Assert
  expect(result).toBe(expected);
});
```

### E2E Test Template

```javascript
test('description', async ({ page }) => {
  await page.goto('/');
  
  await page.locator('#element').click();
  
  await expect(page.locator('.result')).toBeVisible();
});
```

## Troubleshooting

**Q: Unit tests fail with localStorage errors**  
A: jsdom environment is configured in package.json. Make sure jest-environment-jsdom is installed.

**Q: E2E tests can't connect to server**  
A: Ensure port 8080 is available. The webServer config should auto-start it, but you can manually start it first.

**Q: Playwright browsers not installed**  
A: Run `npx playwright install`

**Q: Tests pass locally but fail in CI**  
A: Check CI has required dependencies (browsers, Python/Node for server)

## Future Test Ideas

- Accessibility tests (axe-core)
- Performance tests (Lighthouse CI)
- Visual regression tests (Percy, Chromatic)
- Network offline/online switching tests
- Mobile viewport tests (already configured for Pixel 5)
- Cross-browser tests (Firefox, WebKit)

