import { create } from 'zustand';
import { quotes as fallbackQuotes } from '../utils/quotes';

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

const REMOTE_CONTENT_URL = `https://raw.githubusercontent.com/rawniijae/Tasky/main/content.json?t=${Date.now()}`;

// Map the local fallback quotes to match the Quote interface if needed
const DEFAULT_QUOTES: Quote[] = fallbackQuotes.map((q, idx) => ({
  id: `fallback-${idx}`,
  ...q
}));

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
      
      // Ensure we have valid arrays from the fetch
      const fetchedQuotes = Array.isArray(data.quotes) && data.quotes.length > 0 ? data.quotes : DEFAULT_QUOTES;
      const fetchedRiddles = Array.isArray(data.riddles) && data.riddles.length > 0 ? data.riddles : DEFAULT_RIDDLES;
      const fetchedWellness = Array.isArray(data.wellnessTasks) && data.wellnessTasks.length > 0 ? data.wellnessTasks : DEFAULT_WELLNESS;

      set({
        quotes: fetchedQuotes,
        riddles: fetchedRiddles,
        wellnessTasks: fetchedWellness,
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
    if (!quotes || quotes.length === 0) return null;
    
    // Use a stable date-based index
    const now = new Date();
    const dayCounter = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    return quotes[dayCounter % quotes.length];
  },

  getDailyRiddle: () => {
    const { riddles } = get();
    if (!riddles || riddles.length === 0) return null;
    
    const now = new Date();
    const dayCounter = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    return riddles[dayCounter % riddles.length];
  },

  getRandomWellnessTask: () => {
    const { wellnessTasks } = get();
    if (!wellnessTasks || wellnessTasks.length === 0) return DEFAULT_WELLNESS[0];
    return wellnessTasks[Math.floor(Math.random() * wellnessTasks.length)];
  },
}));

