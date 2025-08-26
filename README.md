# WEN Monitor - Farcaster Mini App

A Next.js-based Farcaster mini-app for tracking WEN mentions across the network with AI-powered insights and interactive features.

## ✨ Features

- **Real-time WEN Tracking**: Monitor Farcaster for mentions of "WEN" in real-time
- **AI Summarization**: Generate intelligent summaries of conversations using OpenAI
- **Wheel of Fortune**: Interactive wheel to randomly select winners from WEN mentions
- **Live Dashboard**: Real-time statistics and monitoring status
- **Configurable Monitoring**: Customize fetch modes, time ranges, and update intervals
- **Neon UI**: Beautiful cyberpunk-inspired interface with glowing effects

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Farcaster API credentials
- OpenAI API key (for AI summaries)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd betrmint-wen
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Configuration

### Farcaster API Setup

1. Get your Farcaster API credentials from [Farcaster](https://farcaster.xyz/)
2. Enter your API URL and token in the configuration panel
3. Test the connection using the "Test Connection" button

### OpenAI Integration

1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Enter your API key in the configuration panel
3. Use the "Generate AI Summary" button to create intelligent summaries

## 🎮 Usage

### Starting the Monitor

1. Configure your API credentials
2. Set your desired monitoring parameters
3. Click "🚀 Start Monitor" to begin tracking
4. Watch real-time WEN mentions appear

### Wheel of Fortune

1. Start monitoring to collect WEN messages
2. Click "🎲 SPIN THE WHEEL" to randomly select a winner
3. Winners are highlighted in the message list

### AI Summaries

1. Ensure you have an OpenAI API key configured
2. Collect some WEN messages by monitoring
3. Click "🤖 Generate AI Summary" for intelligent insights

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom neon theme
- **Animations**: Framer Motion for smooth interactions
- **State Management**: React hooks with localStorage persistence
- **API Routes**: Next.js API routes for backend functionality

## 📁 Project Structure

```
betrmint-wen/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── WenMonitor.tsx     # Main monitor component
│   ├── WheelOfFortune.tsx # Wheel of fortune
│   ├── WinnerDisplay.tsx  # Winner display
│   └── ...                # Other components
├── types/                  # TypeScript definitions
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies
```

## 🎨 Customization

### Colors and Theme

The app uses a custom neon color scheme defined in `tailwind.config.js`:

- **bg**: Deep navy-black (#070a14)
- **cyan**: Bright cyan (#00eaff)
- **pink**: Hot pink (#ff2bd6)
- **yellow**: Bright yellow (#ffe600)

### Styling

- Custom CSS classes in `app/globals.css`
- Tailwind utilities with neon effects
- Responsive design for mobile and desktop

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on push

### Manual Deployment

```bash
pnpm build
pnpm start
```

## 🔌 API Integration

The app includes several API endpoints:

- `/api/wen-data` - Fetch WEN data from Farcaster
- `/api/test-connection` - Test Farcaster API connection
- `/api/ai-summarizer` - Generate AI summaries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Farcaster team for the amazing platform
- OpenAI for AI capabilities
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first approach

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your API credentials
3. Ensure all dependencies are installed
4. Open an issue on GitHub

---

**WEN to the moon! 🚀**
