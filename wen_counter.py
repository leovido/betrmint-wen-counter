#!/usr/bin/env python3
"""
CLI tool to count "WEN" variations in Farcaster messages.
Supports variations like "WEN", "wen", "weeeeen", etc.
"""

import argparse
from datetime import datetime, timezone
import json
import re
import sys
from typing import Dict, List, Tuple, Optional
import requests


class WenCounter:
    def __init__(self):
        # Pattern to match "WEN" variations:
        # - Case insensitive "w" followed by one or more "e"s, then "n"
        # - Allows for extended "e"s like "weeeeen"
        self.wen_pattern = re.compile(r'\bw+e+n+\b', re.IGNORECASE)
    
    def fetch_messages(self, url: str, bearer_token: str) -> Dict:
        """Fetch messages from the Farcaster API."""
        headers = {
            'Authorization': f'Bearer {bearer_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching messages: {e}", file=sys.stderr)
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON response: {e}", file=sys.stderr)
            sys.exit(1)
    
    def count_wen_in_text(self, text: str) -> Tuple[int, List[str]]:
        """Count WEN variations in a text and return matches."""
        matches = self.wen_pattern.findall(text)
        return len(matches), matches
    
    def parse_timestamp(self, timestamp: int) -> datetime:
        """Parse timestamp from milliseconds to datetime object."""
        return datetime.fromtimestamp(timestamp / 1000, tz=timezone.utc)
    
    def format_datetime(self, dt: datetime) -> str:
        """Format datetime for display."""
        return dt.strftime('%Y-%m-%d %H:%M:%S UTC')
    
    def analyze_time_range(self, messages: List[Dict]) -> Dict:
        """Analyze time range of messages."""
        timestamps = []
        for message in messages:
            if 'serverTimestamp' in message:
                timestamps.append(message['serverTimestamp'])
        
        if not timestamps:
            return {
                'first_message_time': None,
                'last_message_time': None,
                'time_span_hours': None,
                'time_span_formatted': None
            }
        
        first_timestamp = min(timestamps)
        last_timestamp = max(timestamps)
        
        first_dt = self.parse_timestamp(first_timestamp)
        last_dt = self.parse_timestamp(last_timestamp)
        
        time_span = last_dt - first_dt
        time_span_hours = time_span.total_seconds() / 3600
        
        # Format time span nicely
        if time_span_hours < 1:
            time_span_formatted = f"{int(time_span.total_seconds() / 60)} minutes"
        elif time_span_hours < 24:
            hours = int(time_span_hours)
            minutes = int((time_span_hours - hours) * 60)
            time_span_formatted = f"{hours}h {minutes}m"
        else:
            days = int(time_span_hours / 24)
            remaining_hours = int(time_span_hours % 24)
            time_span_formatted = f"{days}d {remaining_hours}h"
        
        return {
            'first_message_time': first_dt,
            'last_message_time': last_dt,
            'time_span_hours': time_span_hours,
            'time_span_formatted': time_span_formatted
        }
    
    def analyze_messages(self, api_response: Dict) -> Dict:
        """Analyze messages for WEN variations."""
        if 'result' not in api_response or 'messages' not in api_response['result']:
            print("Invalid API response format", file=sys.stderr)
            sys.exit(1)
        
        messages = api_response['result']['messages']
        total_wen_count = 0
        message_details = []
        
        # Analyze time range for all messages
        time_analysis = self.analyze_time_range(messages)
        
        for message in messages:
            if message.get('type') == 'text' and 'message' in message:
                text = message['message']
                count, matches = self.count_wen_in_text(text)
                
                if count > 0:
                    timestamp = message.get('serverTimestamp')
                    timestamp_dt = self.parse_timestamp(timestamp) if timestamp else None
                    
                    message_details.append({
                        'messageId': message.get('messageId', 'unknown'),
                        'senderFid': message.get('senderFid'),
                        'senderName': message.get('senderContext', {}).get('displayName', 'Unknown'),
                        'senderUsername': message.get('senderContext', {}).get('username', 'unknown'),
                        'text': text,
                        'wen_count': count,
                        'wen_matches': matches,
                        'timestamp': timestamp,
                        'timestamp_formatted': self.format_datetime(timestamp_dt) if timestamp_dt else 'Unknown'
                    })
                    total_wen_count += count
        
        # Sort WEN messages by timestamp (newest first)
        message_details.sort(key=lambda x: x['timestamp'] or 0, reverse=True)
        
        return {
            'total_messages': len(messages),
            'messages_with_wen': len(message_details),
            'total_wen_count': total_wen_count,
            'message_details': message_details,
            'time_analysis': {
                'first_message_time': self.format_datetime(time_analysis['first_message_time']) if time_analysis['first_message_time'] else None,
                'last_message_time': self.format_datetime(time_analysis['last_message_time']) if time_analysis['last_message_time'] else None,
                'time_span_formatted': time_analysis['time_span_formatted']
            }
        }
    
    def format_output(self, analysis: Dict, verbose: bool = False) -> str:
        """Format the analysis results for display."""
        output = []
        output.append("=" * 50)
        output.append("WEN COUNTER RESULTS")
        output.append("=" * 50)
        output.append(f"Total messages analyzed: {analysis['total_messages']}")
        output.append(f"Messages containing WEN: {analysis['messages_with_wen']}")
        output.append(f"Total WEN count: {analysis['total_wen_count']}")
        
        # Add time range information
        time_info = analysis.get('time_analysis', {})
        if time_info.get('first_message_time') and time_info.get('last_message_time'):
            output.append("")
            output.append("TIME RANGE:")
            output.append(f"First message: {time_info['first_message_time']}")
            output.append(f"Last message:  {time_info['last_message_time']}")
            if time_info.get('time_span_formatted'):
                output.append(f"Time span:     {time_info['time_span_formatted']}")
        
        output.append("")
        
        if analysis['message_details']:
            output.append("MESSAGES WITH WEN (newest first):")
            output.append("-" * 40)
            
            for i, msg in enumerate(analysis['message_details'], 1):
                output.append(f"{i}. @{msg['senderUsername']} ({msg['senderName']})")
                output.append(f"   Time: {msg['timestamp_formatted']}")
                output.append(f"   WEN count: {msg['wen_count']}")
                output.append(f"   Matches: {', '.join(msg['wen_matches'])}")
                if verbose:
                    output.append(f"   Message ID: {msg['messageId']}")
                    output.append(f"   Sender FID: {msg['senderFid']}")
                    output.append(f"   Text: \"{msg['text']}\"")
                output.append("")
        else:
            output.append("No WEN variations found in any messages.")
        
        return "\n".join(output)


def main():
    parser = argparse.ArgumentParser(
        description="Count WEN variations in Farcaster messages",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python wen_counter.py --url "https://client.farcaster.xyz/v2/..." --token "MK-..."
  python wen_counter.py -u "https://..." -t "MK-..." --verbose
  python wen_counter.py --url "https://..." --token "MK-..." --json
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
        '-v', '--verbose',
        action='store_true',
        help='Show detailed message information'
    )
    
    parser.add_argument(
        '--json',
        action='store_true',
        help='Output results in JSON format'
    )
    
    args = parser.parse_args()
    
    # Initialize the counter
    counter = WenCounter()
    
    # Fetch and analyze messages
    print("Fetching messages...", file=sys.stderr)
    api_response = counter.fetch_messages(args.url, args.token)
    
    print("Analyzing messages for WEN variations...", file=sys.stderr)
    analysis = counter.analyze_messages(api_response)
    
    # Output results
    if args.json:
        print(json.dumps(analysis, indent=2))
    else:
        print(counter.format_output(analysis, args.verbose))


if __name__ == '__main__':
    main()
