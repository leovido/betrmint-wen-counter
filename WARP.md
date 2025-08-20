# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: WEN Counter CLI, Monitor, and Proxy for Farcaster conversation messages

- Language: Python 3
- Entry points: CLI scripts (wen_counter.py, wen_monitor.py), Flask proxy (proxy_server.py), Flask web dashboard (web_server.py/start_dashboard.py), Vercel serverless proxy (api/proxy.py)

Common commands

- Install dependencies (CLI/Proxy)
  pip3 install -r requirements.txt

- Install dependencies (Web dashboard)
  pip3 install -r requirements-web.txt

- Install dependencies (Vercel utilities, if needed locally)
  pip3 install -r requirements-vercel.txt

CLI: one-time analysis

- Basic
  python3 wen_counter.py --url "<API_URL>" --token "{{FARCASTER_BEARER_TOKEN}}"

- Verbose
  python3 wen_counter.py -u "<API_URL>" -t "{{FARCASTER_BEARER_TOKEN}}" -v

- JSON output
  python3 wen_counter.py -u "<API_URL>" -t "{{FARCASTER_BEARER_TOKEN}}" --json

- Paginated recent messages (time-based)
  python3 wen_counter.py -u "<API_BASE_URL_WITH_QUERY>" -t "{{FARCASTER_BEARER_TOKEN}}" --recent --max-pages 10 --target-hours 48

- Complete history (all pages)
  python3 wen_counter.py -u "<API_BASE_URL_WITH_QUERY>" -t "{{FARCASTER_BEARER_TOKEN}}" --all

- Today filter (UTC calendar day)
  python3 wen_counter.py -u "<API_URL_OR_BASE>" -t "{{FARCASTER_BEARER_TOKEN}}" --today [--recent|--all]

Notes
- When using --recent/--all, provide the base URL without any cursor param; the tool strips cursor if present.
- API_URL is typically Farcaster’s direct-cast-conversation-messages endpoint, or your proxied URL.

Monitor: continuous tracking

- Default (5m, single page)
  python3 wen_monitor.py -u "<API_URL>" -t "{{FARCASTER_BEARER_TOKEN}}"

- Recent mode (1m interval)
  python3 wen_monitor.py -u "<API_URL>" -t "{{FARCASTER_BEARER_TOKEN}}" -i 1m --fetch-mode recent

- All mode (30s interval)
  python3 wen_monitor.py -u "<API_URL>" -t "{{FARCASTER_BEARER_TOKEN}}" -i 30s --fetch-mode all

- Custom: recent mode with extended window
  python3 wen_monitor.py -u "<API_URL>" -t "{{FARCASTER_BEARER_TOKEN}}" -i 2h --fetch-mode recent --max-pages 10 --target-hours 48

- Today-only auto-adjusts fetch strategy
  python3 wen_monitor.py -u "<API_URL>" -t "{{FARCASTER_BEARER_TOKEN}}" --today [--fetch-mode recent|all]

- Demo (no API calls)
  python3 test_monitor_demo.py

Testing

- Full test script (patterns + timestamps)
  python3 test_wen_patterns.py

- Run only pattern tests (no standalone test runner used). This returns non-zero on failure:
  python3 -c "import test_wen_patterns as t, sys; sys.exit(0 if t.test_wen_patterns() else 1)"

- Run only timestamp tests:
  python3 -c "import test_wen_patterns as t, sys; sys.exit(0 if t.test_timestamp_functionality() else 1)"

Web dashboard

- One-step startup (installs web deps, launches server on :5000)
  python3 start_dashboard.py

- Direct launch (if deps already installed)
  python3 web_server.py

- Access: http://localhost:5000 (serves web_dashboard.html, web_dashboard.css, web_dashboard.js)
- Backend endpoint: POST /api/fetch-wen (web_server proxies and invokes WenCounter)

Proxy server (local or production)

- Run locally (defaults: port 8080, upstream https://client.farcaster.xyz/v2)
  python3 proxy_server.py --debug

- Custom port / base URL
  python3 proxy_server.py --port 3000 --farcaster-url "https://client.farcaster.xyz/v2" --debug

- Use with CLI/Monitor (replace original URL with proxied)
  python3 wen_counter.py -u "http://localhost:8080/api/direct-cast-conversation-messages?..." -t "{{FARCASTER_BEARER_TOKEN}}"

- Health check
  curl http://localhost:8080/health

Environment variables recognized by proxy_server.py
- FARCASTER_BASE_URL: upstream Farcaster base (default https://client.farcaster.xyz/v2)
- PROXY_PORT: port (default 8080)
- DEBUG_MODE: true/false

Vercel deployment (serverless proxy)

- Vercel handler: api/proxy.py
- Local structure with vercel.json and vercel-deployment/ contains templates and a Node package.json for Vercel hosting.
- Env for serverless proxy: FARCASTER_BASE_URL (defaults to https://client.farcaster.xyz/v2)
- For high-level deployment steps, see VERCEL_DEPLOY.md and vercel-deployment/README.md.

High-level architecture

Core analysis (wen_counter.py)
- WenCounter encapsulates:
  - Regex-based matching of WEN variations: r'w+e+n+' (case-insensitive) to capture WEN, wen, weeeeen, WEEEEEEEN, etc.
  - Fetch modes:
    - fetch_messages(url, token): Single-page fetch
    - fetch_recent_messages(base_url, token, max_pages, target_hours, filter_today): Paginate until time target or today reached
    - fetch_all_messages(base_url, token): Paginate until no cursor
  - Analysis pipeline:
    - Optional filter to today (UTC)
    - Per-message counting, sorting newest-first
    - Time-range aggregation (first/last timestamps, formatted span)
  - Output formatting for human-readable or JSON

Terminal monitor (wen_monitor.py)
- Wraps WenCounter to periodically fetch and display live stats.
- Modes: single | recent | all, interval parsing (e.g., 30s, 5m, 2h), today filter auto-adjusts pagination.
- Presents a clear terminal dashboard with change indicators (🔄/📈/📉/➡️) and recent WEN messages.

Web dashboard (web_server.py, web_dashboard.*)
- Flask server serving static dashboard and exposing POST /api/fetch-wen that:
  - Accepts apiUrl, bearerToken, fetchMode, maxPages, targetHours, todayFilter
  - Fetches via WenCounter (single/recent/all), returns summarized data for the UI.
- start_dashboard.py installs web dependencies then launches the Flask app.

API proxying
- Local Flask proxy (proxy_server.py): /api/<endpoint> forwards to FARCASTER_BASE_URL/<endpoint>, relays Authorization header, adds permissive CORS, health endpoint /health. Used to obfuscate or centralize Farcaster requests.
- Serverless Vercel proxy (api/proxy.py): HTTP handler that replicates the above behavior in a serverless context using FARCASTER_BASE_URL env.
- deploy_proxy.py prints ready-to-use templates for systemd, nginx, Docker/Docker Compose, plus deployment instructions.

Data flow overview
- Direct mode: CLI/Monitor -> Farcaster API
- Proxied mode: CLI/Monitor -> Proxy (/api/...) -> Farcaster API
- Web dashboard: Browser -> Flask web_server (/api/fetch-wen) -> WenCounter -> Farcaster API (direct) or your proxy depending on apiUrl provided by user

Repository guideposts
- README.md: Comprehensive CLI, monitor, and proxy usage, including deployment examples (nginx, systemd, Docker) and sample outputs.
- WEB_DASHBOARD_README.md: Dashboard features and usage (UI-focused).
- WEB_SERVER_README.md / VERCEL_DEPLOY.md / vercel-deployment/: Additional deployment notes and templates.

Conventions and constraints
- Tests are simple scripts, not a unit-test framework. Use the python -c one-liners above to run individual test functions.
- Bearer tokens are passed via --token flags to CLI scripts and POST bodies to the web server. Prefer providing them at runtime rather than storing in files.
- The counter’s regex matches w+e+n+ anywhere in a word; the analysis code filters messages of type 'text' and aggregates counts per message.

