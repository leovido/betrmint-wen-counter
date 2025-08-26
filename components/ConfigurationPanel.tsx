import type { MonitorConfig } from "@/types/wen";

interface ConfigurationPanelProps {
  config: MonitorConfig;
  onConfigChange: (key: keyof MonitorConfig, value: any) => void;
  onStart: () => void;
  onStop: () => void;
  onTest: () => void;
  onRandomWinner: () => void;
  isRunning: boolean;
}

export default function ConfigurationPanel({
  config,
  onConfigChange,
  onStart,
  onStop,
  onTest,
  onRandomWinner,
  isRunning,
}: ConfigurationPanelProps) {
  return (
    <div>
      <div className="section-title">Configuration</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="apiUrl"
            className="text-cyan text-xs uppercase tracking-wider"
          >
            API URL:
          </label>
          <input
            type="text"
            id="apiUrl"
            className="config-input"
            placeholder="Your URL here..."
            value={config.apiUrl}
            onChange={(e) => onConfigChange("apiUrl", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="apiToken"
            className="text-cyan text-xs uppercase tracking-wider"
          >
            API Token:
          </label>
          <input
            type="password"
            id="apiToken"
            className="config-input"
            placeholder="Enter your API token"
            value={config.apiToken}
            onChange={(e) => onConfigChange("apiToken", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="openaiApiKey"
            className="text-cyan text-xs uppercase tracking-wider"
          >
            OpenAI API Key:
          </label>
          <input
            type="password"
            id="openaiApiKey"
            className="config-input"
            placeholder="Enter your OpenAI API key (sk-...)"
            value={config.openaiApiKey}
            onChange={(e) => onConfigChange("openaiApiKey", e.target.value)}
          />
          <span className="text-white text-xs">
            Required for AI summary generation
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="fetchMode"
            className="text-cyan text-xs uppercase tracking-wider"
          >
            Fetch Mode:
          </label>
          <select
            id="fetchMode"
            className="config-input"
            value={config.fetchMode}
            onChange={(e) => onConfigChange("fetchMode", e.target.value)}
          >
            <option value="single">Single</option>
            <option value="recent">Recent</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="maxPages"
            className="text-cyan text-xs uppercase tracking-wider"
          >
            Max Pages:
          </label>
          <input
            type="number"
            id="maxPages"
            className="config-input"
            value={config.maxPages}
            min="1"
            max="100"
            onChange={(e) =>
              onConfigChange("maxPages", parseInt(e.target.value))
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="targetHours"
            className="text-cyan text-xs uppercase tracking-wider"
          >
            Target Hours:
          </label>
          <input
            type="number"
            id="targetHours"
            className="config-input"
            value={config.targetHours}
            min="1"
            max="168"
            onChange={(e) =>
              onConfigChange("targetHours", parseInt(e.target.value))
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="todayOnly"
            className="text-cyan text-xs uppercase tracking-wider"
          >
            Today Only:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="todayOnly"
              className="w-4 h-4 accent-cyan cursor-pointer"
              checked={config.todayOnly}
              onChange={(e) => onConfigChange("todayOnly", e.target.checked)}
            />
            <span className="text-white text-xs">
              Show only messages from today (00:00 UTC to now)
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="datePicker"
            className="text-cyan text-xs uppercase tracking-wider"
          >
            Select Date:
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              id="datePicker"
              className="config-input flex-1 min-w-36"
              value={config.selectedDate || ""}
              onChange={(e) => onConfigChange("selectedDate", e.target.value)}
            />
            <button
              onClick={() => onConfigChange("selectedDate", null)}
              className="bg-pink text-bg border-none px-3 py-2 rounded text-xs font-semibold cursor-pointer transition-all duration-200 hover:bg-pink/80 hover:-translate-y-0.5"
            >
              Clear
            </button>
          </div>
          <span className="text-white text-xs">
            Show only messages from selected date
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="updateInterval"
            className="text-cyan text-xs uppercase tracking-wider"
          >
            Update Interval (seconds):
          </label>
          <input
            type="number"
            id="updateInterval"
            className="config-input"
            value={config.updateInterval}
            min="30"
            max="3600"
            onChange={(e) =>
              onConfigChange("updateInterval", parseInt(e.target.value))
            }
          />
        </div>
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={onStart}
          disabled={isRunning}
          className="btn btn-start"
        >
          🚀 Start Monitor
        </button>
        <button onClick={onStop} disabled={!isRunning} className="btn btn-stop">
          ⏹️ Stop Monitor
        </button>
        <button onClick={onTest} className="btn btn-test">
          🧪 Test Connection
        </button>
        <button onClick={onRandomWinner} className="btn btn-winner">
          🎲 Random Winner
        </button>
      </div>
    </div>
  );
}
