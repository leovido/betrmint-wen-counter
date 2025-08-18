// WEN Monitor Web Dashboard
class WenMonitorDashboard {
  constructor() {
    this.monitorInterval = null;
    this.updateCount = 0;
    this.startTime = null;
    this.lastWenCount = 0;
    this.isRunning = false;

    this.checkRequiredElements();
    this.initializeEventListeners();
    this.loadSavedConfig();
    this.updateStatusBar();
  }

  checkRequiredElements() {
    const requiredElements = [
      "wenCount",
      "trendIndicator",
      "trendIndicator2",
      "messagesAnalyzed",
      "messagesWithWen",
      "messageTimespan",
      "fetchMode",
      "updateInterval",
      "updatesSoFar",
      "runningTime",
      "lastUpdate",
      "recentMessages",
      "nextUpdate",
      "startMonitor",
      "stopMonitor",
      "testConnection",
      "apiUrl",
      "bearerToken",
      "fetchModeSelect",
      "maxPages",
      "targetHours",
      "updateIntervalSelect",
      "todayFilter",
    ];

    const missingElements = [];
    requiredElements.forEach((id) => {
      if (!document.getElementById(id)) {
        missingElements.push(id);
      }
    });

    if (missingElements.length > 0) {
      console.error("❌ Missing HTML elements:", missingElements);
    } else {
      console.log("✅ All required HTML elements found");
    }
  }

  initializeEventListeners() {
    try {
      // Start/Stop buttons
      const startBtn = document.getElementById("startMonitor");
      const stopBtn = document.getElementById("stopMonitor");
      const testBtn = document.getElementById("testConnection");

      if (startBtn)
        startBtn.addEventListener("click", () => this.startMonitor());
      if (stopBtn) stopBtn.addEventListener("click", () => this.stopMonitor());
      if (testBtn)
        testBtn.addEventListener("click", () => this.testConnection());

      // Configuration changes
      const fetchModeSelect = document.getElementById("fetchModeSelect");
      const maxPages = document.getElementById("maxPages");
      const targetHours = document.getElementById("targetHours");
      const updateIntervalSelect = document.getElementById(
        "updateIntervalSelect"
      );
      const todayFilter = document.getElementById("todayFilter");

      if (fetchModeSelect)
        fetchModeSelect.addEventListener("change", () => this.saveConfig());
      if (maxPages)
        maxPages.addEventListener("change", () => this.saveConfig());
      if (targetHours)
        targetHours.addEventListener("change", () => this.saveConfig());
      if (updateIntervalSelect)
        updateIntervalSelect.addEventListener("change", () =>
          this.saveConfig()
        );
      if (todayFilter)
        todayFilter.addEventListener("change", () => this.saveConfig());

      // Auto-save config inputs
      const apiUrl = document.getElementById("apiUrl");
      const bearerToken = document.getElementById("bearerToken");

      if (apiUrl) apiUrl.addEventListener("input", () => this.saveConfig());
      if (bearerToken)
        bearerToken.addEventListener("input", () => this.saveConfig());
    } catch (error) {
      console.error("❌ Error initializing event listeners:", error);
    }

    // Action buttons
    document.querySelectorAll(".action-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.target.textContent;
        if (action.includes("SHARE")) {
          this.showError("Share functionality coming soon!");
        } else if (action.includes("JOIN")) {
          this.showError("Group chat functionality coming soon!");
        }
      });
    });
  }

  loadSavedConfig() {
    const config = JSON.parse(localStorage.getItem("wenMonitorConfig") || "{}");

    const apiUrl = document.getElementById("apiUrl");
    const bearerToken = document.getElementById("bearerToken");
    const fetchModeSelect = document.getElementById("fetchModeSelect");
    const maxPages = document.getElementById("maxPages");
    const targetHours = document.getElementById("targetHours");
    const updateIntervalSelect = document.getElementById(
      "updateIntervalSelect"
    );
    const todayFilter = document.getElementById("todayFilter");

    if (apiUrl && config.apiUrl) apiUrl.value = config.apiUrl;
    if (bearerToken && config.bearerToken)
      bearerToken.value = config.bearerToken;
    if (fetchModeSelect && config.fetchMode)
      fetchModeSelect.value = config.fetchMode;
    if (maxPages && config.maxPages) maxPages.value = config.maxPages;
    if (targetHours && config.targetHours)
      targetHours.value = config.targetHours;
    if (updateIntervalSelect && config.updateInterval)
      updateIntervalSelect.value = config.updateInterval;
    if (todayFilter && config.todayFilter !== undefined)
      todayFilter.checked = config.todayFilter;
  }

  saveConfig() {
    const config = {
      apiUrl: document.getElementById("apiUrl")?.value || "",
      bearerToken: document.getElementById("bearerToken")?.value || "",
      fetchMode: document.getElementById("fetchModeSelect")?.value || "single",
      maxPages: document.getElementById("maxPages")?.value || "5",
      targetHours: document.getElementById("targetHours")?.value || "24",
      updateInterval:
        document.getElementById("updateIntervalSelect")?.value || "300",
      todayFilter: document.getElementById("todayFilter")?.checked || false,
    };

    localStorage.setItem("wenMonitorConfig", JSON.stringify(config));
  }

  async startMonitor() {
    const config = this.getConfig();

    if (!config.apiUrl || !config.bearerToken) {
      this.showError("Please provide both API URL and Bearer Token");
      return;
    }

    this.isRunning = true;
    this.startTime = new Date();
    this.updateCount = 0;

    // Update UI
    document.getElementById("startMonitor").disabled = true;
    document.getElementById("stopMonitor").disabled = false;
    document.getElementById("connectionStatus").textContent = "Connected";
    document.getElementById("connectionStatus").style.color = "#00ff00";

    // Start monitoring
    this.runUpdate();
    this.scheduleNextUpdate();

    console.log("🚀 Monitor started with config:", config);
  }

  stopMonitor() {
    this.isRunning = false;

    if (this.monitorInterval) {
      clearTimeout(this.monitorInterval);
      this.monitorInterval = null;
    }

    // Update UI
    document.getElementById("startMonitor").disabled = false;
    document.getElementById("stopMonitor").disabled = true;
    document.getElementById("connectionStatus").textContent = "Disconnected";
    document.getElementById("connectionStatus").style.color = "#ff0000";
    document.getElementById("nextUpdate").textContent = "--:--:--";

    console.log("⏹️ Monitor stopped");
  }

  getConfig() {
    return {
      apiUrl: document.getElementById("apiUrl")?.value || "",
      bearerToken: document.getElementById("bearerToken")?.value || "",
      fetchMode: document.getElementById("fetchModeSelect")?.value || "single",
      maxPages: parseInt(document.getElementById("maxPages")?.value || "5"),
      targetHours: parseInt(
        document.getElementById("targetHours")?.value || "24"
      ),
      updateInterval: parseInt(
        document.getElementById("updateIntervalSelect")?.value || "300"
      ),
      todayFilter: document.getElementById("todayFilter")?.checked || false,
    };
  }

  async runUpdate() {
    if (!this.isRunning) return;

    try {
      this.showLoading(true);
      const config = this.getConfig();

      // Simulate API call (replace with actual API integration)
      const data = await this.fetchWenData(config);

      this.updateDashboard(data);
      this.updateCount++;

      // Schedule next update
      this.scheduleNextUpdate();
    } catch (error) {
      console.error("❌ Update failed:", error);
      this.showError(`Update failed: ${error.message}`);

      // Retry in 30 seconds
      if (this.isRunning) {
        setTimeout(() => this.runUpdate(), 30000);
      }
    } finally {
      this.showLoading(false);
    }
  }

  async fetchWenData(config) {
    // Use local web server to proxy API calls and avoid CORS
    try {
      console.log("🌐 Fetching WEN data via local server...");

      const response = await fetch("/api/fetch-wen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiUrl: config.apiUrl,
          bearerToken: config.bearerToken,
          fetchMode: config.fetchMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Received data from server:", data);

      return data;
    } catch (error) {
      console.error("❌ API call failed:", error);
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }

  updateDashboard(data) {
    try {
      // Update WEN count with trend indicator
      const currentCount = data.total_wen_count;
      const trendIndicator = this.getTrendIndicator(currentCount);

      // Safe element updates with null checks
      const wenCount = document.getElementById("wenCount");
      const trendIndicator1 = document.getElementById("trendIndicator");
      const trendIndicator2 = document.getElementById("trendIndicator2");

      if (wenCount) wenCount.textContent = currentCount;
      if (trendIndicator1) trendIndicator1.textContent = trendIndicator;
      if (trendIndicator2) trendIndicator2.textContent = trendIndicator;

      // Update summary stats
      const messagesAnalyzed = document.getElementById("messagesAnalyzed");
      const messagesWithWen = document.getElementById("messagesWithWen");
      const messageTimespan = document.getElementById("messageTimespan");

      if (messagesAnalyzed) messagesAnalyzed.textContent = data.total_messages;
      if (messagesWithWen) messagesWithWen.textContent = data.messages_with_wen;
      if (messageTimespan)
        messageTimespan.textContent = data.time_analysis.time_span_formatted;

      // Update monitor status
      const config = this.getConfig();
      const fetchMode = document.getElementById("fetchMode");
      const updateInterval = document.getElementById("updateInterval");
      const updatesSoFar = document.getElementById("updatesSoFar");
      const runningTime = document.getElementById("runningTime");
      const lastUpdate = document.getElementById("lastUpdate");

      if (fetchMode) fetchMode.textContent = config.fetchMode.toUpperCase();
      if (updateInterval)
        updateInterval.textContent = this.formatInterval(config.updateInterval);
      if (updatesSoFar) updatesSoFar.textContent = this.updateCount;
      if (runningTime) runningTime.textContent = this.getRunningTime();
      if (lastUpdate)
        lastUpdate.textContent = new Date().toLocaleTimeString() + " UTC";

      // Update recent messages
      this.updateRecentMessages(data.message_details);

      // Store last count for trend calculation
      this.lastWenCount = currentCount;
    } catch (error) {
      console.error("❌ Error updating dashboard:", error);
      console.error("❌ Stack trace:", error.stack);
    }
  }

  getTrendIndicator(currentCount) {
    if (this.lastWenCount === 0) return "🔄";
    if (currentCount > this.lastWenCount) return "📈";
    if (currentCount < this.lastWenCount) return "📉";
    return "➡️";
  }

  updateRecentMessages(messages) {
    const container = document.getElementById("recentMessages");

    if (!container) {
      console.error("❌ Could not find recentMessages container");
      return;
    }

    if (!messages || messages.length === 0) {
      container.innerHTML =
        '<div class="no-messages">No WEN messages found yet...</div>';
      return;
    }

    container.innerHTML = messages
      .map(
        (msg, index) => `
            <div class="message-item">
                <div class="message-header">
                    <span class="message-username">@${msg.senderUsername}</span>
                    <span class="message-timestamp">${msg.timestamp_formatted}</span>
                </div>
                <div class="message-text">"${msg.text}"</div>
                <div class="message-wen-count">WEN count: ${msg.wen_count} (${msg.timestamp_formatted})</div>
            </div>
        `
      )
      .join("");
  }

  scheduleNextUpdate() {
    if (!this.isRunning) return;

    const config = this.getConfig();
    const intervalMs = config.updateInterval * 1000;

    this.monitorInterval = setTimeout(() => {
      if (this.isRunning) {
        this.runUpdate();
      }
    }, intervalMs);

    // Update next update time display
    const nextUpdate = new Date(Date.now() + intervalMs);
    const nextUpdateElement = document.getElementById("nextUpdate");
    if (nextUpdateElement) {
      nextUpdateElement.textContent = nextUpdate.toLocaleTimeString();
    }
  }

  getRunningTime() {
    if (!this.startTime) return "00:00:00";

    const now = new Date();
    const diff = now - this.startTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  formatInterval(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  }

  async testConnection() {
    const config = this.getConfig();

    if (!config.apiUrl || !config.bearerToken) {
      this.showError("Please provide both API URL and Bearer Token");
      return;
    }

    try {
      this.showLoading(true);

      // Test the actual API connection
      const response = await fetch(config.apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.bearerToken}`,
          "Content-Type": "application/json",
          "User-Agent": "WEN-Monitor-Dashboard/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} - ${response.statusText}`
        );
      }

      const apiResponse = await response.json();

      // Validate response format
      if (!apiResponse.result || !apiResponse.result.messages) {
        throw new Error("Invalid API response format");
      }

      const messageCount = apiResponse.result.messages.length;
      this.showError(
        `✅ Connection successful! Found ${messageCount} messages.`
      );
    } catch (error) {
      console.error("❌ Connection test failed:", error);
      this.showError(`❌ Connection failed: ${error.message}`);
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    const overlay = document.getElementById("loadingOverlay");
    overlay.style.display = show ? "flex" : "none";
  }

  showError(message) {
    const modal = document.getElementById("errorModal");
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.textContent = message;
    modal.style.display = "flex";
  }

  updateStatusBar() {
    // Update status bar every second
    setInterval(() => {
      if (this.isRunning) {
        document.getElementById("runningTime").textContent =
          this.getRunningTime();
        document.getElementById("updatesSoFar").textContent = this.updateCount;
      }
    }, 1000);
  }
}

// Global functions
function closeErrorModal() {
  document.getElementById("errorModal").style.display = "none";
}

// Initialize dashboard when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM loaded, initializing dashboard...");
  try {
    window.wenDashboard = new WenMonitorDashboard();
    console.log("✅ Dashboard initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize dashboard:", error);
  }
});

// Handle page visibility changes (pause updates when tab is hidden)
document.addEventListener("visibilitychange", () => {
  if (window.wenDashboard) {
    if (document.hidden) {
      console.log("📱 Tab hidden - pausing updates");
    } else {
      console.log("📱 Tab visible - resuming updates");
    }
  }
});

// Handle page unload
window.addEventListener("beforeunload", () => {
  if (window.wenDashboard) {
    window.wenDashboard.cleanup();
  }
});
