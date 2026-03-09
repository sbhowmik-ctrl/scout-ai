# Attribute-Based KNN Search - Integration & Performance Tests

This directory contains comprehensive integration and performance tests for the Attribute-Based KNN Search feature.

## Test Files

### 1. `test_attribute_integration.py`
End-to-end integration tests covering the complete user flow.

**Tests:**
- Basic attribute search flow
- All 6 attribute categories (pace, shooting, passing, dribbling, defending, physical)
- Attribute switching behavior
- Invalid category rejection (HTTP 400)
- Player not found handling (HTTP 404)
- No rating filter validation
- Detailed stats presence
- Similarity ordering
- Complete E2E user journey
- Model caching behavior

**Requirements Validated:** 1.1-1.5, 2.1-2.5, 4.1-4.5, 10.1-10.5

### 2. `test_attribute_performance.py`
Performance tests ensuring the feature meets response time requirements.

**Tests:**
- Startup time with 6 attribute models (< 5 seconds)
- Attribute search response time (< 200ms)
- Cached attribute switch performance
- Performance across all attribute categories
- Concurrent attribute requests
- Repeated searches performance
- Memory efficiency

**Requirements Validated:** 4.5, 8.5

### 3. `run_attribute_tests.py`
Comprehensive test runner that executes all test suites in sequence.

## Prerequisites

1. **Backend server must be running:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Python dependencies installed:**
   ```bash
   pip install requests psutil
   ```

3. **Data file present:**
   - Ensure `backend/data/all_fc_24_players.csv` exists

## Running the Tests

### Option 1: Run All Tests (Recommended)
```bash
cd backend
python run_attribute_tests.py
```

This will run all integration and performance tests in sequence and provide a comprehensive summary.

### Option 2: Run Individual Test Suites

**Integration tests only:**
```bash
cd backend
python test_attribute_integration.py
```

**Performance tests only:**
```bash
cd backend
python test_attribute_performance.py
```

## Expected Output

### Integration Tests
```
=== Test 1: Basic Attribute Search Flow ===
✓ Searched player: Kylian Mbappé (Overall: 91)
✓ Found 3 similar players for attribute 'pace':
  1. Player Name (Overall: XX, Club: YY)
  ...
✓ Test 1 PASSED

...

✓ ALL INTEGRATION TESTS PASSED
```

### Performance Tests
```
=== Test 1: Startup Time with Attribute Models ===
✓ Total startup time: 2.456 seconds
✓ All 6 attribute models trained: pace, shooting, passing, dribbling, defending, physical
✓ PASSED: Startup time 2.456s is under 5 second requirement

...

✓ ALL PERFORMANCE REQUIREMENTS MET
```

## Test Coverage

### Requirements Coverage
- **Requirement 1 (Attribute Selection):** Tests 1, 2, 3, 9
- **Requirement 2 (Similarity Search):** Tests 1, 8
- **Requirement 3 (Multi-Attribute):** Test 2
- **Requirement 4 (API Endpoint):** Tests 1, 4, 5
- **Requirement 5 (Visualization):** Test 7
- **Requirement 6 (Data Model):** Tests 1, 7
- **Requirement 7 (No Rating Filter):** Test 6
- **Requirement 8 (Performance):** All performance tests
- **Requirement 9 (Error Handling):** Tests 4, 5
- **Requirement 10 (Integration):** Test 9

### Property-Based Tests
The integration tests validate several of the 15 correctness properties:
- Property 3: Similar Players Exclusion
- Property 5: Valid Response Structure
- Property 6: Invalid Category Rejection
- Property 7: Similar Players Count Validation
- Property 10: Response Category Match
- Property 11: No Rating Filter Applied
- Property 12: Model Reuse Across Requests
- Property 15: Backward Compatibility Preservation

## Troubleshooting

### Backend Not Running
```
Error: Unable to connect to the server
```
**Solution:** Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

### Import Errors
```
ModuleNotFoundError: No module named 'requests'
```
**Solution:** Install required dependencies:
```bash
pip install requests psutil
```

### Data File Missing
```
FileNotFoundError: CSV file not found at backend/data/all_fc_24_players.csv
```
**Solution:** Ensure the data file is in the correct location.

### Performance Tests Fail
If performance tests show warnings (⚠), this may be acceptable depending on:
- System hardware capabilities
- Network latency
- Current system load

The tests are designed to validate requirements but may show warnings on slower systems.

## CI/CD Integration

To integrate these tests into a CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Start Backend
  run: |
    cd backend
    uvicorn main:app &
    sleep 5  # Wait for startup

- name: Run Integration Tests
  run: |
    cd backend
    python test_attribute_integration.py

- name: Run Performance Tests
  run: |
    cd backend
    python test_attribute_performance.py
```

## Test Maintenance

When adding new features or modifying the attribute search:

1. Update test cases in `test_attribute_integration.py` for new flows
2. Update performance benchmarks in `test_attribute_performance.py` if requirements change
3. Add new test functions following the existing pattern
4. Update this README with new test descriptions

## Contact

For questions or issues with the tests, refer to:
- Design document: `.kiro/specs/attribute-based-knn-search/design.md`
- Requirements document: `.kiro/specs/attribute-based-knn-search/requirements.md`
- Tasks document: `.kiro/specs/attribute-based-knn-search/tasks.md`
