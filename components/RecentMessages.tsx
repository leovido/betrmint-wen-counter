import type { WenMessage } from "@/types/wen";

interface RecentMessagesProps {
  messages: WenMessage[];
  winner: WenMessage | null;
}

export default function RecentMessages({
  messages,
  winner,
}: RecentMessagesProps) {
  if (messages.length === 0) {
    return (
      <div className="msg">
        <div className="handle">No messages yet</div>
        <div className="content">Start monitoring to see WEN messages...</div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {messages.slice(0, 10).map((message) => (
        <div
          key={message.id}
          className={`msg ${
            winner && winner.id === message.id ? "winner-highlight" : ""
          }`}
        >
          <div className="flex justify-between items-center gap-3">
            <div className="handle">{message.handle}</div>
            <div className="timestamp text-muted text-xs font-mono opacity-80">
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </div>
          <div className="content">{message.content}</div>
        </div>
      ))}
    </div>
  );
}
