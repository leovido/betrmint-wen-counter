export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="text-center text-white">
        <div className="loading-spinner" />
        <div className="text-2xl font-bold mb-2.5 text-green-400">
          Starting Monitor...
        </div>
        <div className="text-base text-white/80">
          Fetching Farcaster data...
        </div>
      </div>
    </div>
  );
}
