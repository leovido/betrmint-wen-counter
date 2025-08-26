import { WenMessage } from "@/types/wen";

interface WinnerDisplayProps {
  winner: WenMessage;
}

export default function WinnerDisplay({ winner }: WinnerDisplayProps) {
  return (
    <div>
      <div className="section-title">🏆 WINNER OF THE DAY</div>
      <div className="p-4 rounded-lg bg-pink/10 border border-pink/30">
        <div className="flex justify-between items-center mb-3">
          <div className="winner-handle text-pink font-bold text-base">
            {winner.handle}
          </div>
          <div className="winner-timestamp text-cyan text-xs font-mono">
            {new Date(winner.timestamp).toLocaleString()}
          </div>
        </div>
        <div className="winner-content text-yellow text-sm leading-relaxed">
          {winner.content}
        </div>
      </div>
    </div>
  );
}
