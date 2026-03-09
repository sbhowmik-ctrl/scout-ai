"""
Direct performance test bypassing HTTP layer
"""
import time
from ml_engine import MLEngine

def test_ml_engine_performance():
    """Test ML engine performance directly"""
    print("=" * 60)
    print("Direct ML Engine Performance Test")
    print("=" * 60)
    
    # Test startup
    print("\n=== Startup Time ===")
    start = time.time()
    engine = MLEngine()
    engine.load_data("backend/data/all_fc_24_players.csv")
    engine.train_model()
    startup_time = time.time() - start
    print(f"Startup time: {startup_time:.3f} seconds")
    print(f"Status: {'✓ PASSED' if startup_time < 2.0 else '⚠ CLOSE'} (target: < 2.0s)")
    
    # Test search performance
    print("\n=== Search Performance ===")
    test_players = [
        "Lionel Messi",
        "Cristiano Ronaldo",
        "Kevin De Bruyne",
        "Erling Haaland",
        "Kylian Mbappé"
    ]
    
    # Warm up
    engine.find_hidden_gems("Lionel Messi")
    
    times = []
    for player in test_players:
        start = time.time()
        result = engine.find_hidden_gems(player)
        elapsed = (time.time() - start) * 1000  # ms
        times.append(elapsed)
        print(f"  {player}: {elapsed:.2f}ms")
    
    avg_time = sum(times) / len(times)
    print(f"\nAverage search time: {avg_time:.2f}ms")
    print(f"Status: {'✓ PASSED' if avg_time < 200 else '⚠ SLOW'} (target: < 200ms)")
    
    return startup_time, avg_time

if __name__ == "__main__":
    startup, search = test_ml_engine_performance()
    
    print("\n" + "=" * 60)
    print("Summary:")
    print(f"  Startup: {startup:.3f}s (target: < 2.0s)")
    print(f"  Search: {search:.2f}ms (target: < 200ms)")
    print("=" * 60)
