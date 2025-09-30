# NHD-API Testing Documentation

This directory contains comprehensive tests for the NHD-API backend service.

## Test Structure

```
tests/
├── setup.js                 # Test setup and configuration
├── config/
│   └── test.env            # Test environment variables
├── unit/                   # Unit tests
│   └── models/
│       └── User.test.js    # User model unit tests
├── integration/            # Integration tests
│   ├── auth.test.js        # Authentication routes
│   ├── admin.test.js       # Admin routes
│   └── users.test.js       # User management routes
└── README.md              # This file
```

## Test Types

### Unit Tests
- **Purpose**: Test individual components in isolation
- **Location**: `tests/unit/`
- **Focus**: Model validation, business logic, utility functions
- **Example**: User model validation, password hashing, data transformation

### Integration Tests
- **Purpose**: Test API endpoints with database interactions
- **Location**: `tests/integration/`
- **Focus**: HTTP requests/responses, database operations, authentication flows
- **Example**: Login/register endpoints, admin operations, user management

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Types
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Configuration

### Environment Setup
- Tests use an in-memory MongoDB instance (MongoDB Memory Server)
- Each test suite gets a fresh database
- Test data is cleaned up after each test

### Test Utilities
The `global.testUtils` object provides helper functions:

```javascript
// Create a test user
const user = await global.testUtils.createTestUser({
  email: 'test@example.com',
  role: 'client'
});

// Create an admin user
const admin = await global.testUtils.createTestAdmin();

// Get authentication token
const token = await global.testUtils.getAuthToken(user);
```

### Mock Data
Tests use consistent mock data patterns:
- Test users with predictable email addresses
- Standard passwords for testing
- Company names for business context

## Test Coverage

### Current Coverage Areas
- ✅ User model validation and methods
- ✅ Authentication routes (register, login, verify)
- ✅ Admin routes (create, reset, debug, fix)
- ✅ User management routes (CRUD operations)
- ✅ Authorization and role-based access control

### Areas for Future Testing
- [ ] Project routes
- [ ] Message routes
- [ ] Health check endpoints
- [ ] Error handling middleware
- [ ] Rate limiting
- [ ] CORS configuration

## Writing New Tests

### Unit Test Example
```javascript
describe('Model Name', () => {
  describe('Method Name', () => {
    it('should do something when given valid input', async () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      const result = await Model.method(input);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.property).toBe(expectedValue);
    });
  });
});
```

### Integration Test Example
```javascript
describe('POST /api/endpoint', () => {
  it('should handle request successfully', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .send(testData)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

## Best Practices

### Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the expected behavior
- Follow the Arrange-Act-Assert pattern

### Data Management
- Use `beforeEach` to set up fresh data for each test
- Use `afterEach` to clean up test data
- Use helper functions for common operations

### Assertions
- Test both positive and negative cases
- Verify error messages and status codes
- Check that sensitive data (passwords) is not returned
- Validate response structure and data types

### Performance
- Use in-memory database for fast test execution
- Avoid external API calls in tests
- Use mock data instead of real external services

## Troubleshooting

### Common Issues

**Tests failing with database connection errors**
- Ensure MongoDB Memory Server is properly installed
- Check that test setup is running before tests

**Authentication tests failing**
- Verify JWT_SECRET is set in test environment
- Check that tokens are properly formatted

**Timeout errors**
- Increase test timeout in Jest configuration
- Check for async operations not being awaited

### Debug Mode
Run tests with verbose output:
```bash
npm test -- --verbose
```

## Continuous Integration

Tests are designed to run in CI environments:
- No external dependencies required
- Deterministic test data
- Fast execution with in-memory database
- Clear pass/fail indicators

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass before submitting
3. Add tests for both success and error cases
4. Update this documentation if adding new test patterns
