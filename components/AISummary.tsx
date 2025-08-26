interface AISummaryProps {
  summary: string;
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function AISummary({
  summary,
  isGenerating,
  onGenerate,
}: AISummaryProps) {
  return (
    <div>
      <div className="section-title">🤖 AI Summary</div>
      <div className="p-4">
        {isGenerating ? (
          <div className="text-center py-8">
            <div className="loading-spinner" />
            <div className="text-muted text-sm">Generating AI summary...</div>
          </div>
        ) : summary ? (
          <div className="ai-summary-result space-y-5">
            <div className="summary-section">
              <h4 className="text-purple-500 text-sm font-semibold uppercase tracking-wider mb-2">
                📋 Summary
              </h4>
              <p className="text-white text-sm leading-relaxed">{summary}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-muted text-sm mb-4">
              No AI summary generated yet. Click the button below to generate
              one.
            </div>
            <button onClick={onGenerate} className="btn btn-ai">
              🤖 Generate AI Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
