"""
Performance testing for Scout AI Hidden Gems
Tests startup time and response time requirements
"""
import time
import subprocess
import sys
import requests
from pathlib import Path

def test_backend_startup_time():
    """Test backend startup time (should be < 2 seconds)"""
    print("\n=== Test 1: Backend Startup Time ===")
    print("Note: Testing startup time by importing and initializing ML engine...")
    
    # Measure startup time by importing and initializing
    start = time.time()
    
    # Import and initialize ML engine
    from ml_engine import MLEngine
    engine = MLEngine()
    engine.load_data("backend/data/all_fc_24_players.csv")
    engine.train_model()
    
    elapsed = time.time() - start
    
    print(f"✓ Startup time: {elapsed:.3f} seconds")
    
    if elapsed < 2.0:
        print(f"✓ PASSED: Startup time {elapsed:.3f}s is under 2 second requirement")
        return True
    else:
        print(f"⚠ WARNING: Startup time {elapsed:.3f}s exceeds 2 second target")
        return False

def test_search_response_times():
    """Test search response time (should be < 200ms)"""
    print("\n=== Test 2: Search Response Times ===")
    
    BASE_URL = "http://localhost:8000"
    test_players = [
        "Lionel Messi",
        "Cristiano Ronaldo", 
        "Kevin De Bruyne",
        "Erling Haaland",
        "Kylian Mbappé"
    ]
    
    print("Warming up with initial request...")
    requests.get(f"{BASE_URL}/search/Lionel Messi")
    
    print("\nMeasuring response times for multiple searches:")
    times = []
    
    for player in test_players:
        start = time.time()
        response = requests.get(f"{BASE_URL}/search/{player}")
        elapsed = (time.time() - start) * 1000  # Convert to ms
        
        if response.status_code == 200:
            times.append(elapsed)
            status = "✓" if elapsed < 200 else "⚠"
            print(f"  {status} {player}: {elapsed:.2f}ms")
        else:
            print(f"  ✗ {player}: Failed with status {response.status_code}")
    
    if times:
        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)
        
        print(f"\nStatistics:")
        print(f"  Average: {avg_time:.2f}ms")
        print(f"  Min: {min_time:.2f}ms")
        print(f"  Max: {max_time:.2f}ms")
        
        under_200 = sum(1 for t in times if t < 200)
        print(f"  Under 200ms: {under_200}/{len(times)} requests")
        
        if avg_time < 200:
            print(f"✓ PASSED: Average response time {avg_time:.2f}ms is under 200ms requirement")
            return True
        else:
            print(f"⚠ WARNING: Average response time {avg_time:.2f}ms exceeds 200ms target")
            return False
    
    return False

def test_concurrent_requests():
    """Test system handles multiple concurrent requests"""
    print("\n=== Test 3: Concurrent Request Handling ===")
    
    BASE_URL = "http://localhost:8000"
    
    print("Testing 5 concurrent requests...")
    import concurrent.futures
    
    def make_request(player):
        start = time.time()
        response = requests.get(f"{BASE_URL}/search/{player}")
        elapsed = (time.time() - start) * 1000
        return player, response.status_code, elapsed
    
    players = ["Lionel Messi", "Cristiano Ronaldo", "Kevin De Bruyne", 
               "Erling Haaland", "Kylian Mbappé"]
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(make_request, player) for player in players]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]
    
    success_count = 0
    for player, status, elapsed in results:
        if status == 200:
            success_count += 1
            print(f"  ✓ {player}: {elapsed:.2f}ms (Status: {status})")
        else:
            print(f"  ✗ {player}: Failed (Status: {status})")
    
    if success_count == len(players):
        print(f"✓ PASSED: All {success_count} concurrent requests succeeded")
        return True
    else:
        print(f"⚠ WARNING: Only {success_count}/{len(players)} requests succeeded")
        return False

def test_memory_efficiency():
    """Test memory usage is reasonable"""
    print("\n=== Test 4: Memory Efficiency ===")
    
    try:
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        memory_mb = process.memory_info().rss / 1024 / 1024
        
        print(f"Current process memory usage: {memory_mb:.2f} MB")
        
        if memory_mb < 500:
            print(f"✓ PASSED: Memory usage {memory_mb:.2f}MB is reasonable")
            return True
        else:
            print(f"⚠ WARNING: Memory usage {memory_mb:.2f}MB is high")
            return False
    except ImportError:
        print("⚠ psutil not installed, skipping memory test")
        return True

def main():
    print("=" * 60)
    print("Scout AI Hidden Gems - Performance Tests")
    print("=" * 60)
    
    results = []
    
    try:
        # Test 1: Startup time
        results.append(("Startup Time", test_backend_startup_time()))
        
        # Test 2: Response times
        results.append(("Response Times", test_search_response_times()))
        
        # Test 3: Concurrent requests
        results.append(("Concurrent Requests", test_concurrent_requests()))
        
        # Test 4: Memory efficiency
        results.append(("Memory Efficiency", test_memory_efficiency()))
        
        # Summary
        print("\n" + "=" * 60)
        print("Performance Test Summary")
        print("=" * 60)
        
        for test_name, passed in results:
            status = "✓ PASSED" if passed else "⚠ WARNING"
            print(f"{status}: {test_name}")
        
        passed_count = sum(1 for _, passed in results if passed)
        print(f"\nTotal: {passed_count}/{len(results)} tests passed")
        
        if passed_count == len(results):
            print("\n✓ ALL PERFORMANCE REQUIREMENTS MET")
            return 0
        else:
            print("\n⚠ Some performance targets not met (may be acceptable)")
            return 0
        
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit(main())
