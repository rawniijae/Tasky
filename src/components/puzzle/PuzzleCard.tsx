import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Pressable, Modal } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { usePuzzleStore } from '../../stores/puzzleStore';
import { GlassCard } from '../ui/GlassCard';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const PUZZLE_SIZE = width - 80; // Padding consideration
const PIECE_SIZE = PUZZLE_SIZE / GRID_SIZE;

// Assets generated based on the provided aesthetic
const PUZZLE_IMAGES = [
  require('../../../assets/puzzles/puzzle1.png'),
  require('../../../assets/puzzles/puzzle2.png'),
  require('../../../assets/puzzles/puzzle3.png'),
  require('../../../assets/puzzles/puzzle4.png'),
  require('../../../assets/puzzles/puzzle5.png'),
];

export const PuzzleCard = () => {
  const { colors, typography: t, borderRadius: br } = useTheme();
  const {
    currentImageIndex,
    unlockedPieces,
    isCompleted,
    hasSeenCelebration,
    setHasSeenCelebration,
    nextPuzzle,
    totalPuzzlesCompleted
  } = usePuzzleStore();

  const [showCelebration, setShowCelebration] = useState(false);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isCompleted && !hasSeenCelebration && !showCelebration) {
      setShowCelebration(true);
      scale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
    }
  }, [isCompleted, hasSeenCelebration]);

  const handleNext = () => {
    setShowCelebration(false);
    nextPuzzle();
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    setHasSeenCelebration(true);
  };

  return (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.container}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={[t.titleSmall, { color: colors.text }]}>Weekly Mystery Puzzle</Text>
            <Text style={[t.caption, { color: colors.textTertiary }]}>
              {unlockedPieces.length}/9 pieces collected
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[t.labelSmall, { color: colors.primary }]}>
              {totalPuzzlesCompleted} Solved
            </Text>
          </View>
        </View>

        <View
          key={`grid-${currentImageIndex}`}
          style={[styles.gridContainer, { width: PUZZLE_SIZE, height: PUZZLE_SIZE }]}
        >
          {Array.from({ length: 9 }).map((_, index) => {
            const isUnlocked = unlockedPieces.includes(index);
            const row = Math.floor(index / GRID_SIZE);
            const col = index % GRID_SIZE;

            return (
              <View
                key={`piece-cell-${index}`}
                style={[
                  styles.pieceContainer,
                  {
                    width: PIECE_SIZE,
                    height: PIECE_SIZE,
                    top: row * PIECE_SIZE,
                    left: col * PIECE_SIZE,
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.background,
                    borderWidth: 0.5,
                  }
                ]}
              >
                {isUnlocked ? (
                  <Image
                    key={`piece-image-${currentImageIndex}-${index}`}
                    source={PUZZLE_IMAGES[currentImageIndex]}
                    style={[
                      styles.pieceImage,
                      {
                        width: PUZZLE_SIZE,
                        height: PUZZLE_SIZE,
                        top: -row * PIECE_SIZE,
                        left: -col * PIECE_SIZE,
                      }
                    ]}
                  />
                ) : (
                  <View style={styles.lockedPiece}>
                    <Ionicons name="lock-closed" size={16} color={colors.textTertiary} opacity={0.3} />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {!isCompleted && (
          <Text style={[t.caption, { color: colors.textTertiary, marginTop: 12, textAlign: 'center' }]}>
            Complete tasks to reveal more of the picture!
          </Text>
        )}

        {isCompleted && (
          <Button
            title="Start Next Puzzle"
            onPress={handleNext}
            style={{ marginTop: 16 }}
          />
        )}
      </GlassCard>

      {/* Completion Modal */}
      <Modal visible={showCelebration} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown} style={[styles.modalContent, { backgroundColor: colors.background, borderRadius: br.xl }]}>
            <Text style={[t.titleLarge, { color: colors.text, textAlign: 'center' }]}>Congratulations!</Text>
            <Text style={[t.bodyMedium, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
              You've revealed the full picture by staying productive this week!
            </Text>

            <View style={[styles.fullImageContainer, { borderRadius: br.lg, marginTop: 24 }]}>
              <Image
                source={PUZZLE_IMAGES[currentImageIndex]}
                style={styles.fullImage}
                resizeMode="cover"
              />
            </View>

            <Button
              title="Awesome!"
              onPress={closeCelebration}
              style={{ marginTop: 32, width: '100%' }}
            />
          </Animated.View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  card: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gridContainer: {
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  pieceContainer: {
    position: 'absolute',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieceImage: {
    position: 'absolute',
  },
  lockedPiece: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  modalContent: {
    padding: 32,
    width: '100%',
    alignItems: 'center',
  },
  fullImageContainer: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});
