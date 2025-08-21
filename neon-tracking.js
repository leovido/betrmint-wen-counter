class WenMonitor {
  constructor() {
    this.isRunning = false;
    this.updateInterval = null;
    this.startTime = null;
    this.updateCount = 0;
    this.lastData = null;
    this.backendUrl = window.location.origin; // Use current domain (Vercel)

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
    this.todayOnlyEl = document.getElementById("todayOnly");
    this.updateIntervalInputEl = document.getElementById("updateIntervalInput");

    // Button elements
    this.startBtn = document.getElementById("startMonitor");
    this.stopBtn = document.getElementById("stopMonitor");
    this.testBtn = document.getElementById("testConnection");
    this.randomWinnerBtn = document.getElementById("randomWinner");

    // Winner elements
    this.winnerCard = document.getElementById("winnerCard");
    this.winnerMessage = document.getElementById("winnerMessage");

    // Wheel elements
    this.wheel = document.getElementById("wheel");
    this.spinWheelBtn = document.getElementById("spinWheel");
    this.wheelStatus = document.getElementById("wheelStatus");

    // Confetti container
    this.confettiContainer = document.getElementById("confetti-container");

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
    this.todayOnlyEl.checked = config.todayOnly || false;
    this.updateIntervalInputEl.value = config.updateInterval || 300;
  }

  saveConfiguration() {
    const config = {
      apiUrl: this.apiUrlEl.value,
      apiToken: this.apiTokenEl.value,
      fetchMode: this.fetchModeSelectEl.value,
      maxPages: parseInt(this.maxPagesEl.value),
      targetHours: parseInt(this.targetHoursEl.value),
      todayOnly: this.todayOnlyEl.checked,
      updateInterval: parseInt(this.updateIntervalInputEl.value),
    };

    localStorage.setItem("wenMonitorConfig", JSON.stringify(config));
  }

  setupEventListeners() {
    this.startBtn.addEventListener("click", () => this.startMonitoring());
    this.stopBtn.addEventListener("click", () => this.stopMonitoring());
    this.testBtn.addEventListener("click", () => this.testConnection());
    this.randomWinnerBtn.addEventListener("click", () =>
      this.selectRandomWinner()
    );
    this.spinWheelBtn.addEventListener("click", () => this.spinWheel());

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

    // Add event listener for today checkbox
    this.todayOnlyEl.addEventListener("change", () => this.saveConfiguration());
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
          todayOnly: this.todayOnlyEl.checked,
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
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
        },
        {
          senderUsername: "user2",
          text: "WEN is the question",
          wen_matches: ["WEN"],
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
        },
        {
          senderUsername: "user3",
          text: "When will it happen?",
          wen_matches: ["When"],
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(), // 45 minutes ago
        },
        {
          senderUsername: "user4",
          text: "wen ever netnose want",
          wen_matches: ["wen"],
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
        },
        {
          senderUsername: "user5",
          text: "WEN??",
          wen_matches: ["WEN"],
          timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), // 6 hours ago
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

    // Generate wheel with new participants
    this.generateWheel();

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

    // Debug: Log the first few messages to see timestamp data
    console.log(
      "🔍 Message timestamp debug:",
      messages.slice(0, 3).map((msg) => ({
        username: msg.senderUsername,
        timestamp: msg.timestamp,
        timestampType: typeof msg.timestamp,
        hasTimestamp: !!msg.timestamp,
      }))
    );

    this.recentMessagesEl.innerHTML = messages
      .map((msg, index) => {
        // Format timestamp in DD/MM/YYYY HH:MM UTC format
        let timestamp;

        if (msg.timestamp) {
          // Use the actual message timestamp
          console.log(
            `📅 Processing timestamp for @${msg.senderUsername}:`,
            msg.timestamp
          );
          timestamp =
            new Date(msg.timestamp)
              .toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
                hour12: false,
              })
              .replace(",", "") + " UTC";
        } else if (msg.timestamp_iso || msg.created_at || msg.date) {
          // Try alternative timestamp field names
          const altTimestamp = msg.timestamp_iso || msg.created_at || msg.date;
          console.log(
            `🔄 Using alt timestamp for @${msg.senderUsername}:`,
            altTimestamp
          );
          timestamp =
            new Date(altTimestamp)
              .toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
                hour12: false,
              })
              .replace(",", "") + " UTC";
        } else {
          // Generate a unique timestamp based on message index and current time
          // This ensures each message has a different timestamp for demo purposes
          console.log(
            `⚠️  No timestamp found for @${msg.senderUsername}, generating unique one`
          );
          const baseTime = new Date();
          const offsetMinutes = index * 5; // Each message 5 minutes apart
          const uniqueTime = new Date(
            baseTime.getTime() - offsetMinutes * 60000
          );

          timestamp =
            uniqueTime
              .toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
                hour12: false,
              })
              .replace(",", "") + " UTC";
        }

        return `
          <div class="msg">
            <div class="msg-header">
              <div class="handle">@${msg.senderUsername}</div>
              <div class="timestamp">${timestamp}</div>
            </div>
            <div class="content">${msg.wen_matches.join(", ")} — "${
          msg.text
        }"</div>
          </div>
        `;
      })
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

  selectRandomWinner() {
    if (
      !this.lastData ||
      !this.lastData.message_details ||
      this.lastData.message_details.length === 0
    ) {
      alert(
        "No messages available to select a winner from. Please start monitoring first."
      );
      return;
    }

    // Select a random message from the available messages
    const randomIndex = Math.floor(
      Math.random() * this.lastData.message_details.length
    );
    const winner = this.lastData.message_details[randomIndex];

    // Display the winner
    this.displayWinner(winner);

    // Highlight the winner in the recent messages
    this.highlightWinnerInMessages(randomIndex);

    // Show success message
    console.log(`🎉 Random winner selected: @${winner.senderUsername}`);
  }

  generateWheel() {
    if (
      !this.lastData ||
      !this.lastData.message_details ||
      this.lastData.message_details.length === 0
    ) {
      this.wheelStatus.textContent = "No messages available";
      this.spinWheelBtn.disabled = true;
      return;
    }

    // Clear existing wheel
    const existingSegments = this.wheel.querySelectorAll(".wheel-segment");
    existingSegments.forEach((segment) => segment.remove());

    // Get unique usernames only
    const uniqueUsers = [];
    const seenUsernames = new Set();

    this.lastData.message_details.forEach((msg) => {
      if (!seenUsernames.has(msg.senderUsername)) {
        seenUsernames.add(msg.senderUsername);
        uniqueUsers.push(msg);
      }
    });

    const segmentCount = uniqueUsers.length;
    const segmentAngle = 360 / segmentCount;

    // Create wheel segments with unique users
    uniqueUsers.forEach((msg, index) => {
      const segment = document.createElement("div");
      segment.className = "wheel-segment";

      // Calculate segment angles
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;

      // Create pie slice using CSS clip-path
      const startRadians = (startAngle * Math.PI) / 180;
      const endRadians = (endAngle * Math.PI) / 180;

      const x1 = 50 + 50 * Math.cos(startRadians);
      const y1 = 50 + 50 * Math.sin(startRadians);
      const x2 = 50 + 50 * Math.cos(endRadians);
      const y2 = 50 + 50 * Math.sin(endRadians);

      // Create a pie slice path
      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      // Create SVG path element
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("viewBox", "0 0 100 100");

      const pathElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      pathElement.setAttribute("d", path);
      pathElement.setAttribute("fill", this.getSegmentColor(index));

      svg.appendChild(pathElement);
      segment.appendChild(svg);

      // Add username text
      const text = document.createElement("div");
      text.className = "segment-text";

      // Show more of the username and handle long names better
      let displayName = msg.senderUsername;
      if (displayName.length > 10) {
        displayName = displayName.substring(0, 10) + "...";
      }

      text.textContent = `@${displayName}`;
      text.title = `@${msg.senderUsername}`;

      // Position text in the middle of the segment with better positioning
      const midAngle = startAngle + segmentAngle / 2;
      const midRadians = (midAngle * Math.PI) / 180;

      // Position text closer to center for better fit
      const textRadius = 35; // Closer to center than before
      const textX = 50 + textRadius * Math.cos(midRadians);
      const textY = 50 + textRadius * Math.sin(midRadians);

      text.style.position = "absolute";
      text.style.left = `${textX}%`;
      text.style.top = `${textY}%`;
      text.style.transform = "translate(-50%, -50%)";
      text.style.color = "white";
      text.style.fontSize = "9px";
      text.style.fontWeight = "bold";
      text.style.textShadow = "1px 1px 2px rgba(0, 0, 0, 0.8)";
      text.style.pointerEvents = "none";
      text.style.maxWidth = "80px";
      text.style.textAlign = "center";
      text.style.lineHeight = "1.2";

      segment.appendChild(text);
      this.wheel.appendChild(segment);
    });

    this.wheelStatus.textContent = `Wheel ready with ${segmentCount} unique participants!`;
    this.spinWheelBtn.disabled = false;
  }

  getSegmentColor(index) {
    const colors = ["var(--pink)", "var(--cyan)"];
    return colors[index % colors.length];
  }

  createConfetti() {
    // Clear any existing confetti
    this.confettiContainer.innerHTML = "";

    // Create 50 confetti pieces
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti-piece";

      // Random starting position
      confetti.style.left = Math.random() * 100 + "%";

      // Random delay for staggered effect
      confetti.style.animationDelay = Math.random() * 2 + "s";

      // Random size variation
      const size = 8 + Math.random() * 8;
      confetti.style.width = size + "px";
      confetti.style.height = size + "px";

      // Random rotation
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

      this.confettiContainer.appendChild(confetti);
    }

    // Remove confetti after animation completes
    setTimeout(() => {
      this.confettiContainer.innerHTML = "";
    }, 5000);
  }

  spinWheel() {
    if (
      !this.lastData ||
      !this.lastData.message_details ||
      this.lastData.message_details.length === 0
    ) {
      alert(
        "No messages available to spin the wheel. Please start monitoring first."
      );
      return;
    }

    // Disable spin button during spin
    this.spinWheelBtn.disabled = true;
    this.wheelStatus.textContent = "Spinning...";

    // Get unique users (same logic as generateWheel)
    const uniqueUsers = [];
    const seenUsernames = new Set();

    this.lastData.message_details.forEach((msg) => {
      if (!seenUsernames.has(msg.senderUsername)) {
        seenUsernames.add(msg.senderUsername);
        uniqueUsers.push(msg);
      }
    });

    // Calculate random rotation (multiple full rotations + random segment)
    const segmentCount = uniqueUsers.length;
    const segmentAngle = 360 / segmentCount;
    const randomSegment = Math.floor(Math.random() * segmentCount);
    const fullRotations = 5 + Math.random() * 5; // 5-10 full rotations
    const finalRotation = fullRotations * 360 + randomSegment * segmentAngle;

    // Set CSS custom property for animation
    this.wheel.style.setProperty("--final-rotation", `${finalRotation}deg`);

    // Add spinning class and animate
    this.wheel.classList.add("spinning");
    this.wheel.style.transform = `rotate(${finalRotation}deg)`;

    // After animation completes, select the winner
    setTimeout(() => {
      this.wheel.classList.remove("spinning");

      // Get the winner based on final rotation
      const winner = uniqueUsers[randomSegment];

      // Display the winner
      this.displayWinner(winner);

      // Highlight the winner in the recent messages
      this.highlightWinnerInMessages(randomSegment);

      // Update status
      this.wheelStatus.textContent = `Winner: @${winner.senderUsername}!`;

      // Re-enable spin button after a delay
      setTimeout(() => {
        this.spinWheelBtn.disabled = false;
        this.wheelStatus.textContent = "Ready to spin again!";
      }, 2000);

      console.log(`🎉 Wheel winner: @${winner.senderUsername}`);
    }, 4000); // Match the CSS transition duration
  }

  displayWinner(winner) {
    // Show the winner card
    this.winnerCard.style.display = "block";

    // Format timestamp
    let timestamp = "Unknown time";
    if (winner.timestamp) {
      try {
        timestamp =
          new Date(winner.timestamp)
            .toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "UTC",
              hour12: false,
            })
            .replace(",", "") + " UTC";
      } catch (e) {
        console.error("Error formatting winner timestamp:", e);
      }
    }

    // Update winner display
    this.winnerMessage.innerHTML = `
      <div class="winner-header">
        <div class="winner-handle">@${winner.senderUsername}</div>
        <div class="winner-timestamp">${timestamp}</div>
      </div>
      <div class="winner-content">${winner.wen_matches.join(", ")} — "${
      winner.text
    }"</div>
    `;

    // Add celebration effect
    this.winnerCard.style.animation = "winnerGlow 2s ease-in-out";
    setTimeout(() => {
      this.winnerCard.style.animation = "";
    }, 2000);

    // Trigger confetti celebration
    this.createConfetti();
  }

  highlightWinnerInMessages(winnerIndex) {
    // Remove previous highlights
    const allMessages = this.recentMessagesEl.querySelectorAll(".msg");
    allMessages.forEach((msg) => {
      msg.classList.remove("winner-highlight");
    });

    // Add highlight to the winner message
    if (allMessages[winnerIndex]) {
      allMessages[winnerIndex].classList.add("winner-highlight");

      // Scroll to the winner message
      allMessages[winnerIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
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
