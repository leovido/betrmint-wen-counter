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
        # - Matches "WEN" as a standalone word or as part of other words like "WENing"
        self.wen_pattern = re.compile(r'w+e+n+', re.IGNORECASE)
    
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
    
    def fetch_recent_messages(self, base_url: str, bearer_token: str, max_pages: int = 5, target_hours: int = 24, filter_today: bool = False) -> Dict:
        """
        Fetch recent messages by paginating through results until we get messages within target_hours.
        
        Args:
            base_url: Base API URL without cursor parameters
            bearer_token: Bearer token for authentication
            max_pages: Maximum number of pages to fetch
            target_hours: Target hours to look back (default: 24 hours)
            filter_today: If True, continue fetching until we find today's messages
        """
        all_messages = []
        current_url = base_url
        page_count = 0
        
        # print(f"Fetching messages to get data from the last {target_hours} hours...", file=sys.stderr)
        
        while current_url and page_count < max_pages:
            page_count += 1
            # print(f"Fetching page {page_count}...", file=sys.stderr)
            # print(f"Current URL: {current_url}", file=sys.stderr)
            
            try:
                response = self.fetch_messages(current_url, bearer_token)
                
                if 'result' not in response or 'messages' not in response['result']:
                    print(f"Invalid response format on page {page_count}", file=sys.stderr)
                    break
                
                messages = response['result']['messages']
                # print(f"Page {page_count}: Got {len(messages)} messages", file=sys.stderr)
                
                if not messages:
                    # print(f"No more messages found on page {page_count}", file=sys.stderr)
                    break
                
                all_messages.extend(messages)
                
                # Check if we have recent enough messages
                current_time = datetime.now(timezone.utc)
                target_time = current_time.timestamp() * 1000 - (target_hours * 3600 * 1000)
                
                # Check if the oldest message in this batch is recent enough
                oldest_timestamp = min(msg.get('serverTimestamp', 0) for msg in messages)
                
                # If filtering for today, check if we've reached today's messages
                if filter_today:
                    today_start = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
                    today_start_ms = int(today_start.timestamp() * 1000)
                    
                    if oldest_timestamp >= today_start_ms:
                        # print(f"Reached today's messages on page {page_count}", file=sys.stderr)
                        break
                elif oldest_timestamp > target_time:
                    # print(f"Reached recent messages (within {target_hours} hours) on page {page_count}", file=sys.stderr)
                    break
                
                # Get next page cursor
                # print(f"Response keys: {list(response.keys())}", file=sys.stderr)
                
                if 'next' in response and 'cursor' in response['next']:
                    next_cursor = response['next']['cursor']
                    # print(f"Next page cursor: {next_cursor}", file=sys.stderr)
                    
                    # Parse the base URL and add the cursor properly
                    if '?' in base_url:
                        # Remove any existing cursor parameter first
                        base_parts = base_url.split('&cursor=')
                        if len(base_parts) > 1:
                            base_url = base_parts[0]
                        current_url = f"{base_url}&cursor={next_cursor}"
                    else:
                        current_url = f"{base_url}?cursor={next_cursor}"
                    
                    # print(f"Next URL: {current_url}", file=sys.stderr)
                else:
                    # print(f"No next.cursor found in response", file=sys.stderr)
                    # print(f"Available keys: {list(response.keys())}", file=sys.stderr)
                    if 'next' in response:
                        # print(f"Next object keys: {list(response['next'].keys())}", file=sys.stderr)
                        pass
                    break
                    
            except Exception as e:
                print(f"Error fetching page {page_count}: {e}", file=sys.stderr)
                break
        
        # print(f"Fetched {len(all_messages)} messages across {page_count} pages", file=sys.stderr)
        
        # Sort all messages by timestamp (newest first)
        all_messages.sort(key=lambda x: x.get('serverTimestamp', 0), reverse=True)
        
        # Return in the same format as the original API response
        return {
            'result': {
                'messages': all_messages
            }
        }
    
    def fetch_all_messages(self, base_url: str, bearer_token: str) -> Dict:
        """
        Fetch ALL messages by paginating through results until no more cursor is available.
        
        Args:
            base_url: Base API URL without cursor parameters
            bearer_token: Bearer token for authentication
        """
        all_messages = []
        current_url = base_url
        page_count = 0
        
        # print("Fetching ALL messages until no more cursor is available...", file=sys.stderr)
        
        while current_url:
            page_count += 1
            # print(f"Fetching page {page_count}...", file=sys.stderr)
            # print(f"Current URL: {current_url}", file=sys.stderr)
            
            try:
                response = self.fetch_messages(current_url, bearer_token)
                
                if 'result' not in response or 'messages' not in response['result']:
                    print(f"Invalid response format on page {page_count}", file=sys.stderr)
                    break
                
                messages = response['result']['messages']
                print(f"Page {page_count}: Got {len(messages)} messages", file=sys.stderr)
                
                if not messages:
                    print(f"No more messages found on page {page_count}", file=sys.stderr)
                    break
                
                all_messages.extend(messages)
                
                # Get next page cursor
                print(f"Response keys: {list(response.keys())}", file=sys.stderr)
                
                if 'next' in response and 'cursor' in response['next']:
                    next_cursor = response['next']['cursor']
                    print(f"Next page cursor: {next_cursor}", file=sys.stderr)
                    
                    # Parse the base URL and add the cursor properly
                    if '?' in base_url:
                        # Remove any existing cursor parameter first
                        base_parts = base_url.split('&cursor=')
                        if len(base_parts) > 1:
                            base_url = base_parts[0]
                        current_url = f"{base_url}&cursor={next_cursor}"
                    else:
                        current_url = f"{base_url}?cursor={next_cursor}"
                    
                    print(f"Next URL: {current_url}", file=sys.stderr)
                else:
                    print(f"No next.cursor found - reached the end of all messages", file=sys.stderr)
                    print(f"Available keys: {list(response.keys())}", file=sys.stderr)
                    if 'next' in response:
                        print(f"Next object keys: {list(response['next'].keys())}", file=sys.stderr)
                    break
                    
            except Exception as e:
                print(f"Error fetching page {page_count}: {e}", file=sys.stderr)
                break
        
        print(f"Fetched {len(all_messages)} messages across {page_count} pages (complete conversation history)", file=sys.stderr)
        
        # Sort all messages by timestamp (newest first)
        all_messages.sort(key=lambda x: x.get('serverTimestamp', 0), reverse=True)
        
        # Return in the same format as the original API response
        return {
            'result': {
                'messages': all_messages
            }
        }
    
    def filter_messages_for_today(self, messages: List[Dict]) -> List[Dict]:
        """Filter messages to only include those from today (current calendar day UTC)."""
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        today_start_ms = int(today_start.timestamp() * 1000)
        today_end_ms = int(today_end.timestamp() * 1000)
        
        filtered_messages = []
        for message in messages:
            timestamp = message.get('serverTimestamp', 0)
            if today_start_ms <= timestamp <= today_end_ms:
                filtered_messages.append(message)
        
        return filtered_messages
    
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
    
    def analyze_messages(self, api_response: Dict, filter_today: bool = False) -> Dict:
        """Analyze messages for WEN variations."""
        if 'result' not in api_response or 'messages' not in api_response['result']:
            print("Invalid API response format", file=sys.stderr)
            sys.exit(1)
        
        messages = api_response['result']['messages']
        
        # Filter for today only if requested
        if filter_today:
            messages = self.filter_messages_for_today(messages)
            print(f"Filtered to TODAY only: {len(messages)} messages", file=sys.stderr)
        
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
  # Basic usage
  python wen_counter.py --url "https://client.farcaster.xyz/v2/direct-cast-conversation-messages?conversationId=..." --token "MK-..."
  python wen_counter.py -u "https://..." -t "MK-..." --verbose
  python wen_counter.py --url "https://..." --token "MK-..." --json
  
  # With pagination
  python wen_counter.py -u "https://..." -t "MK-..." --recent --max-pages 10 --target-hours 48
  python wen_counter.py -u "https://..." -t "MK-..." --all
  
  # TODAY only filters
  python wen_counter.py -u "https://..." -t "MK-..." --today
  python wen_counter.py -u "https://..." -t "MK-..." --recent --today
  python wen_counter.py -u "https://..." -t "MK-..." --all --today
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
    
    parser.add_argument(
        '--recent',
        action='store_true',
        help='Fetch recent messages using pagination (recommended for up-to-date data)'
    )
    
    parser.add_argument(
        '--max-pages',
        type=int,
        default=5,
        help='Maximum number of pages to fetch when using --recent (default: 5)'
    )
    
    parser.add_argument(
        '--target-hours',
        type=int,
        default=24,
        help='Target hours to look back when using --recent (default: 24)'
    )
    
    parser.add_argument(
        '--all',
        action='store_true',
        help='Fetch ALL messages until no more cursor is available (complete conversation history)'
    )
    
    parser.add_argument(
        '--today',
        action='store_true',
        help='Filter messages to TODAY only (current calendar day, midnight to midnight UTC)'
    )
    
    args = parser.parse_args()
    
    # Initialize the counter
    counter = WenCounter()
    
    # Fetch and analyze messages
    if args.all:
        # print("Fetching ALL messages using pagination...", file=sys.stderr)
        # Remove any existing cursor parameters from the URL
        base_url = args.url.split('&cursor=')[0].split('?cursor=')[0]
        api_response = counter.fetch_all_messages(base_url, args.token)
    elif args.recent:
        # print("Fetching recent messages using pagination...", file=sys.stderr)
        # Remove any existing cursor parameters from the URL
        base_url = args.url.split('&cursor=')[0].split('?cursor=')[0]
        api_response = counter.fetch_recent_messages(base_url, args.token, args.max_pages, args.target_hours, args.today)
    else:
        # print("Fetching messages...", file=sys.stderr)
        api_response = counter.fetch_messages(args.url, args.token)
    
    # print("Analyzing messages for WEN variations...", file=sys.stderr)
    analysis = counter.analyze_messages(api_response, filter_today=args.today)
    
    # Output results
    if args.json:
        print(json.dumps(analysis, indent=2))
    else:
        print(counter.format_output(analysis, args.verbose))


if __name__ == '__main__':
    main()
