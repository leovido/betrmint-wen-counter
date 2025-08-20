class WenMonitor {
  constructor() {
    this.isRunning = false;
    this.updateInterval = null;
    this.startTime = null;
    this.updateCount = 0;
    this.lastData = null;
    this.backendUrl = "http://localhost:5000"; // Default Flask server URL

    this.initializeElements();
    this.loadConfiguration();
    this.setupEventListeners();
  }

  initializeElements() {
    // Main display elements
    this.wenCountEl = document.getElementById("wenCount");
    this.messagesAnalyzedEl = document.getElementById("messagesAnalyzed");
    this.messagesWithWenEl = document.getElementById("messagesWithWen");
    this.messageTimespanEl = document.getElementById("messageTimespan");

    // Status elements
    this.fetchModeEl = document.getElementById("fetchMode");
    this.filterStatusEl = document.getElementById("filterStatus");
    this.updateIntervalEl = document.getElementById("updateInterval");
    this.updatesCountEl = document.getElementById("updatesCount");
    this.runningTimeEl = document.getElementById("runningTime");
    this.lastUpdateEl = document.getElementById("lastUpdate");

    // Configuration elements
    this.apiUrlEl = document.getElementById("apiUrl");
    this.apiTokenEl = document.getElementById("apiToken");
    this.fetchModeSelectEl = document.getElementById("fetchModeSelect");
    this.maxPagesEl = document.getElementById("maxPages");
    this.targetHoursEl = document.getElementById("targetHours");
    this.updateIntervalInputEl = document.getElementById("updateIntervalInput");

    // Button elements
    this.startBtn = document.getElementById("startMonitor");
    this.stopBtn = document.getElementById("stopMonitor");
    this.testBtn = document.getElementById("testConnection");

    // Messages container
    this.recentMessagesEl = document.getElementById("recentMessages");
  }

  loadConfiguration() {
    // Load saved configuration from localStorage
    const config = JSON.parse(localStorage.getItem("wenMonitorConfig") || "{}");

    this.apiUrlEl.value = config.apiUrl || "";
    this.apiTokenEl.value = config.apiToken || "";
    this.fetchModeSelectEl.value = config.fetchMode || "recent";
    this.maxPagesEl.value = config.maxPages || 5;
    this.targetHoursEl.value = config.targetHours || 24;
    this.updateIntervalInputEl.value = config.updateInterval || 300;
  }

  saveConfiguration() {
    const config = {
      apiUrl: this.apiUrlEl.value,
      apiToken: this.apiTokenEl.value,
      fetchMode: this.fetchModeSelectEl.value,
      maxPages: parseInt(this.maxPagesEl.value),
      targetHours: parseInt(this.targetHoursEl.value),
      updateInterval: parseInt(this.updateIntervalInputEl.value),
    };

    localStorage.setItem("wenMonitorConfig", JSON.stringify(config));
  }

  setupEventListeners() {
    this.startBtn.addEventListener("click", () => this.startMonitoring());
    this.stopBtn.addEventListener("click", () => this.stopMonitoring());
    this.testBtn.addEventListener("click", () => this.testConnection());

    // Save config on input changes
    [
      this.apiUrlEl,
      this.apiTokenEl,
      this.fetchModeSelectEl,
      this.maxPagesEl,
      this.targetHoursEl,
      this.updateIntervalInputEl,
    ].forEach((el) =>
      el.addEventListener("change", () => this.saveConfiguration())
    );
  }

  async startMonitoring() {
    if (!this.apiUrlEl.value || !this.apiTokenEl.value) {
      alert("Please enter both API URL and Token");
      return;
    }

    this.saveConfiguration();
    this.isRunning = true;
    this.startTime = new Date();
    this.updateCount = 0;

    this.startBtn.disabled = true;
    this.stopBtn.disabled = false;

    // Update UI immediately
    this.updateStatus();

    // Start the monitoring loop
    this.monitorLoop();
  }

  stopMonitoring() {
    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;

    this.updateStatus();
  }

  async monitorLoop() {
    if (!this.isRunning) return;

    try {
      await this.fetchData();
      this.updateCount++;
      this.updateStatus();
    } catch (error) {
      console.error("Error in monitor loop:", error);
      // Show error in UI
      this.showError(`Failed to fetch data: ${error.message}`);
    }

    // Schedule next update
    const interval = parseInt(this.updateIntervalInputEl.value) * 1000;
    this.updateInterval = setTimeout(() => this.monitorLoop(), interval);
  }

  async fetchData() {
    // Connect to your wen_monitor.py backend
    try {
      const response = await fetch(`${this.backendUrl}/api/wen-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiUrl: this.apiUrlEl.value,
          apiToken: this.apiTokenEl.value,
          fetchMode: this.fetchModeSelectEl.value,
          maxPages: parseInt(this.maxPagesEl.value),
          targetHours: parseInt(this.targetHoursEl.value),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      this.lastData = data;
      this.updateDisplay(data);

      // Clear any previous errors
      this.clearError();
    } catch (error) {
      console.error("Error fetching data:", error);

      // If backend is not available, fall back to mock data for demo
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        console.log("Backend not available, using mock data for demo");
        this.useMockData();
      } else {
        throw error;
      }
    }
  }

  useMockData() {
    // Fallback mock data when backend is not available
    const mockData = {
      total_wen_count: Math.floor(Math.random() * 100) + 1,
      total_messages: Math.floor(Math.random() * 500) + 100,
      messages_with_wen: Math.floor(Math.random() * 50) + 10,
      time_analysis: {
        time_span_formatted: `${Math.floor(Math.random() * 24)}h ${Math.floor(
          Math.random() * 60
        )}m`,
      },
      message_details: [
        {
          senderUsername: "user1",
          text: "wen moon?",
          wen_matches: ["wen"],
        },
        {
          senderUsername: "user2",
          text: "WEN is the question",
          wen_matches: ["WEN"],
        },
        {
          senderUsername: "user3",
          text: "When will it happen?",
          wen_matches: ["When"],
        },
      ],
    };

    this.lastData = mockData;
    this.updateDisplay(mockData);

    // Show demo mode indicator
    this.showDemoMode();
  }

  showDemoMode() {
    // Add a demo mode indicator to the UI
    const demoIndicator =
      document.getElementById("demoIndicator") || this.createDemoIndicator();
    demoIndicator.style.display = "block";
  }

  createDemoIndicator() {
    const indicator = document.createElement("div");
    indicator.id = "demoIndicator";
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 165, 0, 0.9);
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: bold;
      z-index: 1000;
      border: 1px solid orange;
    `;
    indicator.textContent = "DEMO MODE - Mock Data";
    document.body.appendChild(indicator);
    return indicator;
  }

  clearError() {
    const errorIndicator = document.getElementById("errorIndicator");
    if (errorIndicator) {
      errorIndicator.style.display = "none";
    }
  }

  showError(message) {
    const errorIndicator =
      document.getElementById("errorIndicator") || this.createErrorIndicator();
    errorIndicator.textContent = `Error: ${message}`;
    errorIndicator.style.display = "block";
  }

  createErrorIndicator() {
    const indicator = document.createElement("div");
    indicator.id = "errorIndicator";
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      font-size: 12px;
      font-weight: bold;
      z-index: 1000;
      border: 1px solid red;
      max-width: 300px;
      word-wrap: break-word;
    `;
    document.body.appendChild(indicator);
    return indicator;
  }

  updateDisplay(data) {
    // Update main WEN count with animation
    this.animateCountChange(this.wenCountEl, data.total_wen_count);

    // Update summary KPIs
    this.messagesAnalyzedEl.textContent = data.total_messages;
    this.messagesWithWenEl.textContent = data.messages_with_wen;
    this.messageTimespanEl.textContent = data.time_analysis.time_span_formatted;

    // Update recent messages
    this.updateRecentMessages(data.message_details);

    // Update last update time
    this.lastUpdateEl.textContent = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      timeZone: "UTC",
    });
  }

  animateCountChange(element, newValue) {
    const oldValue = parseInt(element.textContent) || 0;
    const difference = newValue - oldValue;

    // Add visual feedback for count changes
    if (difference > 0) {
      element.style.color = "#00ff00"; // Green for increase
      setTimeout(() => {
        element.style.color = "var(--pink)"; // Back to normal
      }, 1000);
    } else if (difference < 0) {
      element.style.color = "#ff0000"; // Red for decrease
      setTimeout(() => {
        element.style.color = "var(--pink)"; // Back to normal
      }, 1000);
    }

    element.textContent = newValue;
  }

  updateRecentMessages(messages) {
    if (!messages || messages.length === 0) {
      this.recentMessagesEl.innerHTML = `
        <div class="msg">
          <div class="handle">No messages found</div>
          <div class="content">No WEN messages in this update...</div>
        </div>
      `;
      return;
    }

    this.recentMessagesEl.innerHTML = messages
      .map(
        (msg, index) => `
        <div class="msg">
          <div class="handle">@${msg.senderUsername}</div>
          <div class="content">${msg.wen_matches.join(", ")} — "${
          msg.text
        }"</div>
        </div>
      `
      )
      .join("");
  }

  updateStatus() {
    if (this.isRunning) {
      this.fetchModeEl.textContent = this.fetchModeSelectEl.value.toUpperCase();
      this.filterStatusEl.textContent = "ACTIVE";
      this.updateIntervalEl.textContent = `${this.updateIntervalInputEl.value}s`;
      this.updatesCountEl.textContent = this.updateCount;
    } else {
      this.fetchModeEl.textContent = "--";
      this.filterStatusEl.textContent = "STOPPED";
      this.updateIntervalEl.textContent = "--";
      this.updatesCountEl.textContent = "0";
    }

    // Update running time
    if (this.startTime && this.isRunning) {
      this.updateRunningTime();
    } else {
      this.runningTimeEl.textContent = "00:00:00";
    }
  }

  updateRunningTime() {
    if (!this.startTime || !this.isRunning) return;

    const now = new Date();
    const diff = now - this.startTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    this.runningTimeEl.textContent = `${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    // Update every second
    setTimeout(() => this.updateRunningTime(), 1000);
  }

  async testConnection() {
    if (!this.apiUrlEl.value || !this.apiTokenEl.value) {
      alert("Please enter both API URL and Token");
      return;
    }

    this.testBtn.disabled = true;
    this.testBtn.textContent = "Testing...";

    try {
      // Test the connection to your wen_monitor.py backend
      const response = await fetch(`${this.backendUrl}/api/test-connection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiUrl: this.apiUrlEl.value,
          apiToken: this.apiTokenEl.value,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        alert("✅ Connection test successful!");
      } else {
        throw new Error(result.error || "Connection failed");
      }
    } catch (error) {
      console.error("Connection test failed:", error);

      // If backend is not available, show helpful message
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        alert(
          "❌ Backend server not available. Please start your Flask server first."
        );
      } else {
        alert("❌ Connection test failed: " + error.message);
      }
    } finally {
      this.testBtn.disabled = false;
      this.testBtn.textContent = "🧪 Test Connection";
    }
  }
}

// Initialize the monitor when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new WenMonitor();
});
