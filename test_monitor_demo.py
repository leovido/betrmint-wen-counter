#!/usr/bin/env python3
"""
Demo script to show how the WEN Monitor would look with active WEN messages.
Creates mock data to simulate a live conversation with WEN activity.
"""

import time
import json
from datetime import datetime, timezone
from wen_monitor import WenMonitor


class MockWenMonitor(WenMonitor):
    """Mock version of WenMonitor for demonstration purposes."""
    
    def __init__(self, interval: int = 5):
        # Don't call super().__init__ to avoid needing real URL/token
        self.interval = interval
        self.running = True
        self.last_count = None
        self.start_time = datetime.now(timezone.utc)
        self.demo_iteration = 0
        
        # Set up signal handlers
        import signal
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _fetch_and_count(self):
        """Generate mock data for demo."""
        self.demo_iteration += 1
        
        # Simulate different scenarios
        if self.demo_iteration == 1:
            # First check - no WEN
            return {
                'total_messages': 25,
                'messages_with_wen': 0,
                'total_wen_count': 0,
                'message_details': [],
                'time_analysis': {
                    'first_message_time': '2025-08-17 21:30:00 UTC',
                    'last_message_time': '2025-08-17 22:00:00 UTC',
                    'time_span_formatted': '30 minutes'
                }
            }
        elif self.demo_iteration == 2:
            # Second check - first WEN appears!
            return {
                'total_messages': 30,
                'messages_with_wen': 1,
                'total_wen_count': 1,
                'message_details': [
                    {
                        'senderUsername': 'crypto_enthusiast',
                        'senderName': 'Crypto Enthusiast 🚀',
                        'wen_matches': ['WEN'],
                        'text': 'WEN moon? This project looks promising! 🚀',
                        'timestamp_formatted': '2025-08-17 22:05:30 UTC'
                    }
                ],
                'time_analysis': {
                    'first_message_time': '2025-08-17 21:30:00 UTC',
                    'last_message_time': '2025-08-17 22:05:30 UTC',
                    'time_span_formatted': '35 minutes'
                }
            }
        elif self.demo_iteration == 3:
            # Third check - WEN fever spreads!
            return {
                'total_messages': 45,
                'messages_with_wen': 3,
                'total_wen_count': 5,
                'message_details': [
                    {
                        'senderUsername': 'diamond_hands',
                        'senderName': 'Diamond Hands 💎',
                        'wen_matches': ['weeeeen', 'WEN'],
                        'text': 'weeeeen lambo? WEN financial freedom? LFG!',
                        'timestamp_formatted': '2025-08-17 22:10:15 UTC'
                    },
                    {
                        'senderUsername': 'moon_boy',
                        'senderName': 'Moon Boy 🌙',
                        'wen_matches': ['wen'],
                        'text': 'wen are we going to see some real action here?',
                        'timestamp_formatted': '2025-08-17 22:08:45 UTC'
                    },
                    {
                        'senderUsername': 'crypto_enthusiast',
                        'senderName': 'Crypto Enthusiast 🚀',
                        'wen_matches': ['WEN'],
                        'text': 'WEN moon? This project looks promising! 🚀',
                        'timestamp_formatted': '2025-08-17 22:05:30 UTC'
                    }
                ],
                'time_analysis': {
                    'first_message_time': '2025-08-17 21:30:00 UTC',
                    'last_message_time': '2025-08-17 22:10:15 UTC',
                    'time_span_formatted': '40 minutes'
                }
            }
        else:
            # Ongoing activity with slight variations
            base_count = 5 + (self.demo_iteration - 3) * 2
            return {
                'total_messages': 45 + (self.demo_iteration - 3) * 5,
                'messages_with_wen': 3 + (self.demo_iteration - 3),
                'total_wen_count': base_count,
                'message_details': [
                    {
                        'senderUsername': 'wen_master',
                        'senderName': 'WEN Master ⏰',
                        'wen_matches': ['WEEEEEEEN'],
                        'text': 'WEEEEEEEN are we getting those gains?! 📈',
                        'timestamp_formatted': f'2025-08-17 22:{10 + self.demo_iteration}:00 UTC'
                    },
                    {
                        'senderUsername': 'diamond_hands',
                        'senderName': 'Diamond Hands 💎',
                        'wen_matches': ['weeeeen', 'WEN'],
                        'text': 'weeeeen lambo? WEN financial freedom? LFG!',
                        'timestamp_formatted': '2025-08-17 22:10:15 UTC'
                    },
                    {
                        'senderUsername': 'moon_boy',
                        'senderName': 'Moon Boy 🌙',
                        'wen_matches': ['wen'],
                        'text': 'wen are we going to see some real action here?',
                        'timestamp_formatted': '2025-08-17 22:08:45 UTC'
                    }
                ],
                'time_analysis': {
                    'first_message_time': '2025-08-17 21:30:00 UTC',
                    'last_message_time': f'2025-08-17 22:{10 + self.demo_iteration}:00 UTC',
                    'time_span_formatted': f'{40 + self.demo_iteration} minutes'
                }
            }


def main():
    print("🎭 WEN Monitor Demo")
    print("This demo shows how the monitor looks with live WEN activity")
    print("Updates every 5 seconds for demo purposes")
    print("Press Ctrl+C to stop")
    print()
    input("Press Enter to start the demo...")
    
    demo_monitor = MockWenMonitor(interval=5)  # 5 seconds for demo
    demo_monitor.run()


if __name__ == '__main__':
    main()
