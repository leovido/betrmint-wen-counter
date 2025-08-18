#!/usr/bin/env python3
"""
Test script to verify WEN pattern matching works correctly.
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from wen_counter import WenCounter


def test_wen_patterns():
    counter = WenCounter()
    
    test_cases = [
        # Basic cases
        ("WEN moon?", 1, ["WEN"]),
        ("wen lambo?", 1, ["wen"]),
        ("When will this happen?", 0, []),
        
        # Extended e's
        ("weeeeen moon?", 1, ["weeeeen"]),
        ("WEEEEEEEN LAMBO!", 1, ["WEEEEEEEN"]),
        
        # Multiple occurrences
        ("WEN moon? wen lambo? WEEEEEN!", 3, ["WEN", "wen", "WEEEEEN"]),
        
        # Mixed case
        ("WeN mOoN?", 1, ["WeN"]),
        
        # Word boundaries (should not match partial words)
        ("towel", 0, []),
        ("wendys", 0, []),
        ("owen", 0, []),
        
        # Real sentences
        ("Hey everyone, WEN is the next pump happening?", 1, ["WEN"]),
        ("I'm wondering wen we get rich", 1, ["wen"]),
        ("No matches in this sentence.", 0, []),
    ]
    
    print("Testing WEN pattern matching...")
    print("=" * 50)
    
    all_passed = True
    for i, (text, expected_count, expected_matches) in enumerate(test_cases, 1):
        count, matches = counter.count_wen_in_text(text)
        
        passed = count == expected_count and sorted(matches) == sorted(expected_matches)
        status = "✅ PASS" if passed else "❌ FAIL"
        
        print(f"Test {i}: {status}")
        print(f"  Text: \"{text}\"")
        print(f"  Expected: {expected_count} matches {expected_matches}")
        print(f"  Got:      {count} matches {matches}")
        print()
        
        if not passed:
            all_passed = False
    
    return all_passed


def test_timestamp_functionality():
    """Test timestamp parsing and formatting."""
    counter = WenCounter()
    
    print("\nTesting timestamp functionality...")
    print("=" * 50)
    
    # Test timestamp parsing
    test_timestamp = 1755308938783  # milliseconds
    dt = counter.parse_timestamp(test_timestamp)
    formatted = counter.format_datetime(dt)
    
    print(f"Test timestamp: {test_timestamp}")
    print(f"Parsed datetime: {dt}")
    print(f"Formatted: {formatted}")
    
    # Test time range analysis with mock data
    mock_messages = [
        {'serverTimestamp': 1755308938783},  # First
        {'serverTimestamp': 1755312538783},  # 1 hour later
        {'serverTimestamp': 1755316138783},  # 2 hours later
    ]
    
    time_analysis = counter.analyze_time_range(mock_messages)
    print(f"\nTime analysis:")
    print(f"  First: {counter.format_datetime(time_analysis['first_message_time'])}")
    print(f"  Last:  {counter.format_datetime(time_analysis['last_message_time'])}")
    print(f"  Span:  {time_analysis['time_span_formatted']}")
    
    # Basic validation
    if time_analysis['time_span_formatted'] == "2h 0m":
        print("✅ Timestamp functionality working correctly!")
        return True
    else:
        print("❌ Timestamp functionality failed!")
        return False


if __name__ == "__main__":
    pattern_tests_passed = test_wen_patterns()
    timestamp_tests_passed = test_timestamp_functionality()
    
    print("\n" + "=" * 50)
    if pattern_tests_passed and timestamp_tests_passed:
        print("🎉 All tests passed!")
    else:
        print("💥 Some tests failed!")
        sys.exit(1)
