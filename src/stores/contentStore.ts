import { create } from 'zustand';

export interface Quote {
  id: string;
  text: string;
  author: string;
}

export interface Riddle {
  id: string;
  question: string;
  hint: string;
  answer: string;
}

interface ContentState {
  quotes: Quote[];
  riddles: Riddle[];
  wellnessTasks: string[];
  isLoading: boolean;
  lastFetched: number | null;
}

interface ContentActions {
  fetchContent: () => Promise<void>;
  getDailyQuote: () => Quote | null;
  getDailyRiddle: () => Riddle | null;
  getRandomWellnessTask: () => string;
}

const REMOTE_CONTENT_URL = 'https://raw.githubusercontent.com/rawniijae/Tasky/main/content.json';

const DEFAULT_QUOTES: Quote[] = [
  { id: '1', text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' }
];

const DEFAULT_RIDDLES: Riddle[] = [
  { id: '1', question: 'What has to be broken before you can use it?', hint: 'Think of breakfast.', answer: 'An egg' }
];

const DEFAULT_WELLNESS = ['Take a deep breath 🧘', 'Drink some water 💧'];

export const useContentStore = create<ContentState & ContentActions>((set, get) => ({
  quotes: DEFAULT_QUOTES,
  riddles: DEFAULT_RIDDLES,
  wellnessTasks: DEFAULT_WELLNESS,
  isLoading: false,
  lastFetched: null,

  fetchContent: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch(REMOTE_CONTENT_URL);
      const data = await response.json();
      set({
        quotes: data.quotes || DEFAULT_QUOTES,
        riddles: data.riddles || DEFAULT_RIDDLES,
        wellnessTasks: data.wellnessTasks || DEFAULT_WELLNESS,
        lastFetched: Date.now(),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch remote content:', error);
      set({ isLoading: false });
    }
  },

  getDailyQuote: () => {
    const { quotes } = get();
    if (quotes.length === 0) return null;
    const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return quotes[dayOfYear % quotes.length];
  },

  getDailyRiddle: () => {
    const { riddles } = get();
    if (riddles.length === 0) return null;
    const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return riddles[dayOfYear % riddles.length];
  },

  getRandomWellnessTask: () => {
    const { wellnessTasks } = get();
    if (wellnessTasks.length === 0) return DEFAULT_WELLNESS[0];
    return wellnessTasks[Math.floor(Math.random() * wellnessTasks.length)];
  },
}));
