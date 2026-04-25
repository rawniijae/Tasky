import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandMMKVStorage } from '../utils/storage';

export interface PuzzleState {
  currentImageIndex: number;
  unlockedPieces: number[]; // indices 0-8 for a 3x3 grid
  isCompleted: boolean;
  hasSeenCelebration: boolean;
  totalPuzzlesCompleted: number;
}

interface PuzzleActions {
  unlockPiece: () => void;
  resetPuzzle: () => void;
  nextPuzzle: () => void;
  setHasSeenCelebration: (seen: boolean) => void;
}

export const usePuzzleStore = create<PuzzleState & PuzzleActions>()(
  persist(
    (set, get) => ({
      currentImageIndex: 0,
      unlockedPieces: [],
      isCompleted: false,
      hasSeenCelebration: false,
      totalPuzzlesCompleted: 0,

      unlockPiece: () => {
        set((state) => {
          if (state.isCompleted || state.unlockedPieces.length >= 9) return state;

          // Find a random piece that isn't unlocked yet
          const availablePieces = Array.from({ length: 9 }, (_, i) => i).filter(
            (i) => !state.unlockedPieces.includes(i)
          );

          if (availablePieces.length === 0) return state;

          const randomPiece = availablePieces[Math.floor(Math.random() * availablePieces.length)];
          const newUnlocked = [...state.unlockedPieces, randomPiece];
          
          return {
            ...state,
            unlockedPieces: newUnlocked,
            isCompleted: newUnlocked.length === 9,
            hasSeenCelebration: false, // Reset when a new piece is unlocked
          };
        });
      },
      setHasSeenCelebration: (seen: boolean) => set({ hasSeenCelebration: seen }),

      resetPuzzle: () => set({ unlockedPieces: [], isCompleted: false, hasSeenCelebration: false }),

      nextPuzzle: () => set((state) => ({
        ...state,
        currentImageIndex: (state.currentImageIndex + 1) % 5,
        unlockedPieces: [],
        isCompleted: false,
        hasSeenCelebration: false,
        totalPuzzlesCompleted: state.totalPuzzlesCompleted + 1,
      })),
    }),
    {
      name: 'puzzle-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
