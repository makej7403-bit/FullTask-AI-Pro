export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isLoading?: boolean;
  groundingMetadata?: {
    web?: { uri: string; title: string }[];
  };
  imageUrl?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export enum ModelType {
  STANDARD = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview', // More reasoning
  SEARCH = 'search-grounding', // Uses flash with tools
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
