"""
Test runner for Attribute-Based KNN Search
Runs all integration and performance tests in sequence
"""
import subprocess
import sys
import time


def run_test_file(test_file: str, description: str) -> bool:
    """Run a test file and return success status"""
    print("\n" + "=" * 70)
    print(f"Running: {description}")
    print("=" * 70)
    
    try:
        result = subprocess.run(
            [sys.executable, test_file],
            capture_output=False,
            text=True,
            cwd="backend"
        )
        
        if result.returncode == 0:
            print(f"\n✓ {description} - PASSED")
            return True
        else:
            print(f"\n⚠ {description} - FAILED (exit code: {result.returncode})")
            return False
            
    except Exception as e:
        print(f"\n✗ {description} - ERROR: {e}")
        return False


def main():
    print("=" * 70)
    print("ATTRIBUTE-BASED KNN SEARCH - COMPREHENSIVE TEST SUITE")
    print("=" * 70)
    print("\nThis test suite validates:")
    print("  • End-to-end integration flows")
    print("  • Performance requirements")
    print("  • All 15 correctness properties")
    print("  • Error handling and edge cases")
    print("\nNote: Backend server must be running on http://localhost:8000")
    
    input("\nPress Enter to start tests...")
    
    start_time = time.time()
    results = []
    
    # Test 1: Integration tests
    passed = run_test_file(
        "test_attribute_integration.py",
        "Integration Tests (E2E Flow, Caching, Error Handling)"
    )
    results.append(("Integration Tests", passed))
    
    # Test 2: Performance tests
    passed = run_test_file(
        "test_attribute_performance.py",
        "Performance Tests (Response Time, Startup, Caching)"
    )
    results.append(("Performance Tests", passed))
    
    # Calculate total time
    total_time = time.time() - start_time
    
    # Final summary
    print("\n" + "=" * 70)
    print("FINAL TEST SUMMARY")
    print("=" * 70)
    
    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{status}: {test_name}")
    
    passed_count = sum(1 for _, passed in results if passed)
    print(f"\nTotal: {passed_count}/{len(results)} test suites passed")
    print(f"Total execution time: {total_time:.2f} seconds")
    
    if passed_count == len(results):
        print("\n" + "=" * 70)
        print("✓ ALL TEST SUITES PASSED")
        print("=" * 70)
        print("\nAttribute-Based KNN Search feature is ready for production!")
        print("\nValidated requirements:")
        print("  ✓ Requirements 1.1-1.5: Attribute category selection")
        print("  ✓ Requirements 2.1-2.5: Attribute-based similarity search")
        print("  ✓ Requirements 3.1-3.6: Multi-attribute granular search")
        print("  ✓ Requirements 4.1-4.5: Attribute search API endpoint")
        print("  ✓ Requirements 5.1-5.5: Attribute comparison visualization")
        print("  ✓ Requirements 6.1-6.5: Data model for attribute search")
        print("  ✓ Requirements 7.1-7.5: No rating restriction")
        print("  ✓ Requirements 8.1-8.5: Attribute search performance")
        print("  ✓ Requirements 9.1-9.5: Error handling")
        print("  ✓ Requirements 10.1-10.5: Integration with existing features")
        return 0
    else:
        print("\n" + "=" * 70)
        print("⚠ SOME TESTS FAILED")
        print("=" * 70)
        print("\nPlease review the test output above for details.")
        return 1


if __name__ == "__main__":
    exit(main())
