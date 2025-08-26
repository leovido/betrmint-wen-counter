export interface WenMessage {
  id: string;
  handle: string;
  content: string;
  timestamp: string;
  hash: string;
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfp: string;
    verified: boolean;
  };
  reactions: {
    likes: number;
    recasts: number;
    replies: number;
  };
  mentions: string[];
  embeds: any[];
  parentUrl?: string;
  channel?: string;
}

export interface MonitorConfig {
  apiUrl: string;
  apiToken: string;
  openaiApiKey: string;
  fetchMode: "single" | "recent" | "all";
  maxPages: number;
  targetHours: number;
  todayOnly: boolean;
  updateInterval: number;
  selectedDate: string | null;
}

export interface WheelSegment {
  id: number;
  text: string;
  message: WenMessage;
}

export interface AISummaryData {
  overview: string;
  themes: string[];
  sentiment: string;
  wenContext: string;
  actionItems: string[];
  keyUsers: string[];
  keyInsights: string;
  recommendations: string[];
}

export interface WenDataResponse {
  wenCount: number;
  messagesAnalyzed: number;
  messagesWithWen: number;
  messageTimespan: string;
  messages: WenMessage[];
  error?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface AISummaryResponse {
  summary: string;
  error?: string;
}
