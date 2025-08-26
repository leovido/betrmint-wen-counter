"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import WenIcon from "./WenIcon";
import WheelOfFortune from "./WheelOfFortune";
import WinnerDisplay from "./WinnerDisplay";
import RecentMessages from "./RecentMessages";
import AISummary from "./AISummary";
import ConfigurationPanel from "./ConfigurationPanel";
import LoadingOverlay from "./LoadingOverlay";
import type { WenMessage, MonitorConfig, WheelSegment } from "@/types/wen";
import sdk from "@farcaster/frame-sdk";

export default function WenMonitor() {
  // State for monitor data
  const [wenCount, setWenCount] = useState(0);
  const [messagesAnalyzed, setMessagesAnalyzed] = useState(0);
  const [messagesWithWen, setMessagesWithWen] = useState(0);
  const [messageTimespan, setMessageTimespan] = useState("0m");
  const [formattedMessages, setFormattedMessages] = useState<WenMessage[]>([]);

  // State for monitor status
  const [fetchMode, setFetchMode] = useState("--");
  const [filterStatus, setFilterStatus] = useState("--");
  const [updateInterval, setUpdateInterval] = useState("--");
  const [updatesCount, setUpdatesCount] = useState(0);
  const [runningTime, setRunningTime] = useState("00:00:00");
  const [lastUpdate, setLastUpdate] = useState("--:--:--");

  // State for monitor control
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [updateIntervalId, setUpdateIntervalId] =
    useState<NodeJS.Timeout | null>(null);

  // State for configuration
  const [config, setConfig] = useState<MonitorConfig>({
    apiUrl: "",
    apiToken: "",
    openaiApiKey: "",
    fetchMode: "recent",
    maxPages: 5,
    targetHours: 24,
    todayOnly: false,
    updateInterval: 300,
    selectedDate: null,
  });

  // State for winner and wheel
  const [winner, setWinner] = useState<WenMessage | null>(null);
  const [wheelSegments, setWheelSegments] = useState<WheelSegment[]>([]);
  const [isWheelSpinning] = useState(false);

  // State for AI summary
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // State for loading
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const runningTimeRef = useRef<NodeJS.Timeout | null>(null);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("wenMonitorConfig");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Failed to parse saved config:", error);
      }
    }
  }, []);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  // Save configuration to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("wenMonitorConfig", JSON.stringify(config));
  }, [config]);

  // Update running time
  useEffect(() => {
    if (isRunning && startTime) {
      runningTimeRef.current = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setRunningTime(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }, 1000);
    } else {
      if (runningTimeRef.current) {
        clearInterval(runningTimeRef.current);
        runningTimeRef.current = null;
      }
    }

    return () => {
      if (runningTimeRef.current) {
        clearInterval(runningTimeRef.current);
      }
    };
  }, [isRunning, startTime]);

  // Start monitor
  const startMonitor = async () => {
    if (!config.apiUrl || !config.apiToken) {
      alert("Please enter API URL and Token");
      return;
    }

    setIsLoading(true);
    setIsRunning(true);
    setStartTime(new Date());
    setUpdatesCount(0);

    try {
      // Start the monitoring process
      await fetchWenData();

      // Set up interval for updates
      const interval = setInterval(async () => {
        await fetchWenData();
        setUpdatesCount((prev) => prev + 1);
        setLastUpdate(new Date().toLocaleTimeString());
      }, config.updateInterval * 1000);

      setUpdateIntervalId(interval);
    } catch (error) {
      console.error("Failed to start monitor:", error);
      setIsRunning(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Stop monitor
  const stopMonitor = () => {
    setIsRunning(false);
    if (updateIntervalId) {
      clearInterval(updateIntervalId);
      setUpdateIntervalId(null);
    }
    if (runningTimeRef.current) {
      clearInterval(runningTimeRef.current);
      runningTimeRef.current = null;
    }
  };

  // Fetch WEN data
  const fetchWenData = async () => {
    try {
      const response = await fetch("/api/wen-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update state with fetched data
      setWenCount(data.wenCount || 0);
      setMessagesAnalyzed(data.messagesAnalyzed || 0);
      setMessagesWithWen(data.messagesWithWen || 0);
      setMessageTimespan(data.messageTimespan || "0m");
      setFormattedMessages(data.messages || []);

      // Update wheel segments if we have messages
      if (data.messages && data.messages.length > 0) {
        const segments = data.messages.map(
          (msg: WenMessage, index: number) => ({
            id: index,
            text: msg.handle,
            message: msg,
          })
        );
        setWheelSegments(segments);
      }

      // Update status
      setFetchMode(config.fetchMode);
      setFilterStatus(config.todayOnly ? "Today Only" : "All Time");
      setUpdateInterval(`${config.updateInterval}s`);
    } catch (error) {
      console.error("Failed to fetch WEN data:", error);
    }
  };

  // Test connection
  const testConnection = async () => {
    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert("Connection successful!");
      } else {
        alert("Connection failed. Check your API credentials.");
      }
    } catch (error) {
      alert("Connection test failed. Check console for details.");
      console.error("Connection test error:", error);
    }
  };

  // Generate AI summary
  const generateAISummary = async () => {
    if (!config.openaiApiKey) {
      alert("Please enter your OpenAI API key");
      return;
    }

    if (formattedMessages.length === 0) {
      alert("No messages to summarize. Start monitoring first.");
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const response = await fetch("/api/ai-summarizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: formattedMessages,
          openaiApiKey: config.openaiApiKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.summary || "No summary generated");
      } else {
        throw new Error("Failed to generate summary");
      }
    } catch (error) {
      console.error("AI summary generation failed:", error);
      setAiSummary("Failed to generate summary. Check console for details.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Random winner selection
  const selectRandomWinner = () => {
    if (formattedMessages.length === 0) {
      alert("No messages to select from. Start monitoring first.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * formattedMessages.length);
    const selectedMessage = formattedMessages[randomIndex];
    setWinner(selectedMessage);
  };

  // Handle configuration changes
  const handleConfigChange = (key: keyof MonitorConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="terminal-frame">
      <motion.div
        className="title text-shadow-neon-cyan"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        WEN MONITOR – LIVE TRACKING
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Left Column: WEN COUNT + SUMMARY */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="section-title">Overview</div>
          <div className="wen-count">
            <WenIcon />
            <span>
              WEN COUNT:
              <span className="text-pink text-shadow-neon-pink ml-2">
                {wenCount}
              </span>
            </span>
          </div>

          <div className="section-title mt-4">Summary</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="kpi">
              <div className="label">Messages analyzed</div>
              <div className="value">{messagesAnalyzed}</div>
            </div>
            <div className="kpi">
              <div className="label">Messages with WEN</div>
              <div className="value">{messagesWithWen}</div>
            </div>
            <div className="kpi">
              <div className="label">Message timespan</div>
              <div className="value">{messageTimespan}</div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Monitor Status */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="section-title">Monitor Status</div>
          <div className="grid grid-cols-1 gap-2">
            <div className="status row">
              <div className="key">Fetch mode</div>
              <div className="val">{fetchMode}</div>
            </div>
            <div className="status row">
              <div className="key">Filter</div>
              <div className="val">{filterStatus}</div>
            </div>
            <div className="status row">
              <div className="key">Update interval</div>
              <div className="val">{updateInterval}</div>
            </div>
            <div className="status row">
              <div className="key">Updates so far</div>
              <div className="val">{updatesCount}</div>
            </div>
            <div className="status row">
              <div className="key">Running time</div>
              <div className="val">{runningTime}</div>
            </div>
            <div className="status row">
              <div className="key">Last update</div>
              <div className="val">{lastUpdate}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Wheel of Fortune */}
      <motion.div
        className="card mt-4 border-2 border-cyan shadow-neon-cyan"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="section-title">🎡 WHEEL OF FORTUNE</div>
        <WheelOfFortune
          segments={wheelSegments}
          isSpinning={isWheelSpinning}
          onSpin={(winner) => setWinner(winner)}
        />
      </motion.div>

      {/* Winner Display */}
      {winner && (
        <motion.div
          className="card mt-4 border-2 border-pink shadow-pink/30 bg-pink/5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <WinnerDisplay winner={winner} />
        </motion.div>
      )}

      {/* Recent Messages */}
      <motion.div
        className="card mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="section-title">Recent WEN Messages</div>
        <RecentMessages messages={formattedMessages} winner={winner} />
      </motion.div>

      {/* AI Summary Section */}
      <motion.div
        className="card mt-4 border border-purple-500/25"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <AISummary
          summary={aiSummary}
          isGenerating={isGeneratingSummary}
          onGenerate={generateAISummary}
        />
      </motion.div>

      {/* Configuration Panel */}
      <motion.div
        className="card mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <ConfigurationPanel
          config={config}
          onConfigChange={handleConfigChange}
          onStart={startMonitor}
          onStop={stopMonitor}
          onTest={testConnection}
          onRandomWinner={selectRandomWinner}
          isRunning={isRunning}
        />
      </motion.div>

      <div className="footer mt-5 text-center text-cyan text-shadow-neon-cyan font-bold tracking-wider">
        Press <span className="text-pink">Ctrl</span>+
        <span className="text-pink">C</span> to stop monitoring.
      </div>

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay />}
    </div>
  );
}
