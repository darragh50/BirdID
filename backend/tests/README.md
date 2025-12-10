# Backend Tests

This directory contains comprehensive tests for the Bird Identifier backend API

## Test Structure
```
tests/
├── conftest.py              # Pytest configuration and fixtures
├── testapihealth.py       # Health check endpoint tests
├── testapiauth.py         # Authentication tests
├── testapirecordings.py   # Recording CRUD tests
├── testmodels.py           # Database model tests
├── testdb.py              # Database connection tests
├── tests3.py              # S3 integration tests
└── testfirebase.py        # Firebase integration tests
```

## Running Tests

### Run All Tests
```bash
pytest
```

### Run Specific Test File
```bash
pytest tests/testapihealth.py
```

### Run Tests by Category
```bash
pytest -m unit          # Unit tests only
pytest -m api           # API tests only
pytest -m integration   # Integration tests only
```

### Run with Coverage
```bash
pytest --cov=. --cov-report=html
```

View coverage report: Open `htmlcov/index.html` in browser

## Test Categories

- **Unit Tests** (`@pytest.mark.unit`): Test individual functions/classes
- **API Tests** (`@pytest.mark.api`): Test API endpoints
- **Integration Tests** (`@pytest.mark.integration`): Test multiple components together
- **Slow Tests** (`@pytest.mark.slow`): Tests that take longer (S3, Firebase etc)

## Writing New Tests

1. Create test file: `test_<feature>.py`
2. Import pytest: `import pytest`
3. Add markers: `@pytest.mark.unit` or `@pytest.mark.api`
4. Write test functions: `def testSomething(client):`
5. Use assertions: `assert result == expected`

## CI/CD

Tests run automatically on every push via GitHub Actions
