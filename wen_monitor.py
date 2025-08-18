#!/usr/bin/env python3
"""
Continuous WEN Monitor - Live tracking of WEN variations in Farcaster messages.
Updates at configurable intervals and displays real-time counts.
"""

import argparse
import signal
import sys
import time
from datetime import datetime, timezone
from typing import Dict, Optional

# Import from our main counter
from wen_counter import WenCounter


class WenMonitor:
    def __init__(self, url: str, token: str, interval: int = 300, fetch_mode: str = 'single', max_pages: int = 5, target_hours: int = 24):
        self.url = url
        self.token = token
        self.interval = interval  # seconds
        self.fetch_mode = fetch_mode  # 'single', 'recent', or 'all'
        self.max_pages = max_pages
        self.target_hours = target_hours
        self.counter = WenCounter()
        self.running = True
        self.last_count = None
        self.start_time = datetime.now(timezone.utc)
        
        # Set up graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully."""
        print("\n📡 Monitor stopping...")
        self.running = False
    
    def _clear_screen(self):
        """Clear the terminal screen."""
        import os
        os.system('cls' if os.name == 'nt' else 'clear')
    
    def _format_interval(self, seconds: int) -> str:
        """Format interval in a human-readable way."""
        if seconds < 60:
            return f"{seconds}s"
        elif seconds < 3600:
            return f"{seconds // 60}m"
        else:
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            return f"{hours}h{minutes}m" if minutes > 0 else f"{hours}h"
    
    def _get_change_indicator(self, current_count: int) -> str:
        """Get a visual indicator for count changes."""
        if self.last_count is None:
            return "🔄"
        elif current_count > self.last_count:
            return "📈"
        elif current_count < self.last_count:
            return "📉"
        else:
            return "➡️"
    
    def _fetch_and_count(self) -> Optional[Dict]:
        """Fetch messages and count WEN variations."""
        try:
            if self.fetch_mode == 'all':
                # Remove any existing cursor parameters from the URL
                base_url = self.url.split('&cursor=')[0].split('?cursor=')[0]
                api_response = self.counter.fetch_all_messages(base_url, self.token)
            elif self.fetch_mode == 'recent':
                # Remove any existing cursor parameters from the URL
                base_url = self.url.split('&cursor=')[0].split('?cursor=')[0]
                api_response = self.counter.fetch_recent_messages(base_url, self.token, self.max_pages, self.target_hours)
            else:  # single mode
                api_response = self.counter.fetch_messages(self.url, self.token)
            
            analysis = self.counter.analyze_messages(api_response)
            return analysis
        except Exception as e:
            print(f"❌ Error fetching data: {e}")
            return None
    
    def _display_status(self, analysis: Dict, update_count: int):
        """Display the current status."""
        self._clear_screen()
        
        current_time = datetime.now(timezone.utc)
        uptime = current_time - self.start_time
        uptime_str = str(uptime).split('.')[0]  # Remove microseconds
        
        total_count = analysis['total_wen_count']
        change_indicator = self._get_change_indicator(total_count)
        
        # Header
        print("🚨" * 20)
        print("      WEN MONITOR - LIVE TRACKING")
        print("🚨" * 20)
        print()
        
        # Main count display (big and prominent)
        print(f"{change_indicator} WEN COUNT: {total_count} {change_indicator}")
        print()
        
        # Summary stats
        print("📊 SUMMARY:")
        print(f"   Messages analyzed: {analysis['total_messages']}")
        print(f"   Messages with WEN: {analysis['messages_with_wen']}")
        
        # Time info
        time_info = analysis.get('time_analysis', {})
        if time_info.get('time_span_formatted'):
            print(f"   Message timespan:  {time_info['time_span_formatted']}")
        
        print()
        
        # Monitor info
        print("⚙️  MONITOR STATUS:")
        print(f"   Fetch mode:      {self.fetch_mode.upper()}")
        if self.fetch_mode == 'recent':
            print(f"   Max pages:       {self.max_pages}")
            print(f"   Target hours:    {self.target_hours}")
        print(f"   Update interval: {self._format_interval(self.interval)}")
        print(f"   Updates so far:  {update_count}")
        print(f"   Running time:    {uptime_str}")
        print(f"   Last update:     {current_time.strftime('%H:%M:%S UTC')}")
        
        # Show recent WEN messages if any
        if analysis['message_details']:
            print()
            print("🔥 RECENT WEN MESSAGES:")
            # Show up to 3 most recent
            for i, msg in enumerate(analysis['message_details'][:3], 1):
                print(f"   {i}. @{msg['senderUsername']}: {', '.join(msg['wen_matches'])}")
                if len(msg['text']) > 50:
                    text_preview = msg['text'][:47] + "..."
                else:
                    text_preview = msg['text']
                print(f"      \"{text_preview}\"")
        
        print()
        print("💡 Press Ctrl+C to stop monitoring")
        
        # Update last count for next comparison
        self.last_count = total_count
    
    def run(self):
        """Run the continuous monitor."""
        print("🚀 Starting WEN Monitor...")
        print(f"📡 Monitoring every {self._format_interval(self.interval)}")
        print("⏳ Fetching initial data...")
        
        update_count = 0
        
        while self.running:
            # Fetch and analyze
            analysis = self._fetch_and_count()
            
            if analysis is not None:
                update_count += 1
                self._display_status(analysis, update_count)
            else:
                print("⚠️  Failed to fetch data, retrying in 30 seconds...")
                time.sleep(30)
                continue
            
            # Wait for next update
            if self.running:  # Check if we're still supposed to be running
                try:
                    time.sleep(self.interval)
                except KeyboardInterrupt:
                    break
        
        print("👋 WEN Monitor stopped")


def parse_interval(interval_str: str) -> int:
    """Parse interval string like '5m', '1h', '30s' to seconds."""
    interval_str = interval_str.lower().strip()
    
    if interval_str.endswith('s'):
        return int(interval_str[:-1])
    elif interval_str.endswith('m'):
        return int(interval_str[:-1]) * 60
    elif interval_str.endswith('h'):
        return int(interval_str[:-1]) * 3600
    else:
        # Assume it's just a number in minutes (backward compatibility)
        return int(interval_str) * 60


def main():
    parser = argparse.ArgumentParser(
        description="Continuous WEN monitor for Farcaster messages",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Monitor every 5 minutes (default) - single page only
  python wen_monitor.py -u "https://..." -t "token"
  
  # Monitor every 1 minute with recent messages (time-based)
  python wen_monitor.py -u "https://..." -t "token" -i 1m --fetch-mode recent
  
  # Monitor every 30 seconds with all messages (complete history)
  python wen_monitor.py -u "https://..." -t "token" -i 30s --fetch-mode all
  
  # Monitor every 2 hours with recent messages (custom settings)
  python wen_monitor.py -u "https://..." -t "token" -i 2h --fetch-mode recent --max-pages 10 --target-hours 48

Fetch Modes:
  single  = 1 page only (100 messages max) - fastest
  recent  = Multiple pages until target time reached - balanced
  all     = All pages until no more cursor - complete history

Interval formats:
  30s  = 30 seconds
  5m   = 5 minutes  
  2h   = 2 hours
  300  = 300 minutes (backward compatibility)
        """
    )
    
    parser.add_argument(
        '-u', '--url',
        required=True,
        help='Farcaster API URL'
    )
    
    parser.add_argument(
        '-t', '--token',
        required=True,
        help='Bearer token for authentication'
    )
    
    parser.add_argument(
        '-i', '--interval',
        default='5m',
        help='Update interval (e.g., 30s, 5m, 1h). Default: 5m'
    )
    
    parser.add_argument(
        '--fetch-mode',
        choices=['single', 'recent', 'all'],
        default='single',
        help='Fetch mode: single (1 page), recent (time-based), or all (complete history). Default: single'
    )
    
    parser.add_argument(
        '--max-pages',
        type=int,
        default=5,
        help='Maximum pages to fetch when using recent mode (default: 5)'
    )
    
    parser.add_argument(
        '--target-hours',
        type=int,
        default=24,
        help='Target hours to look back when using recent mode (default: 24)'
    )
    
    args = parser.parse_args()
    
    try:
        interval_seconds = parse_interval(args.interval)
        
        # Validate interval
        if interval_seconds < 10:
            print("⚠️  Warning: Intervals less than 10 seconds may hit API rate limits")
        if interval_seconds > 86400:  # 24 hours
            print("⚠️  Warning: Intervals longer than 24 hours might not be very useful")
        
        monitor = WenMonitor(
            args.url, 
            args.token, 
            interval_seconds,
            args.fetch_mode,
            args.max_pages,
            args.target_hours
        )
        monitor.run()
        
    except ValueError as e:
        print(f"❌ Invalid interval format: {args.interval}")
        print("Use formats like: 30s, 5m, 2h")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Monitor stopped by user")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
