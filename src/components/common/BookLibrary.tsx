import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeProvider';
import { GlassCard } from '../ui/GlassCard';
import { useHaptics } from '@/src/hooks/useHaptics';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string; // URL string
  pdfUrl: string;
  color: string;
  pages?: number;
  description?: string;
}

// Fallback books if fetch fails
export const DEFAULT_BOOKS: Book[] = [
  {
    id: 'ikigai',
    title: 'Ikigai',
    author: 'Héctor García & Francesc Miralles',
    cover: 'https://raw.githubusercontent.com/rawniijae/Tasky/main/assets/books/ikigai_cover.png',
    pdfUrl: 'https://raw.githubusercontent.com/ThisIsSakshi/Books/master/Timepass%20%F0%9F%A4%97/Ikigai.pdf',
    color: '#E8915B',
    pages: 194,
    description: 'The Japanese Secret to a Long and Happy Life',
  },
];

// URL where you will host your books.json
// You can use a GitHub Raw URL or any JSON hosting service
export const REMOTE_BOOKS_URL = 'https://raw.githubusercontent.com/rawniijae/Tasky/main/books.json';

export function BookLibrary() {
  const { colors, typography: t, isDark } = useTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const [books, setBooks] = React.useState<Book[]>(DEFAULT_BOOKS);

  React.useEffect(() => {
    fetch(REMOTE_BOOKS_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBooks(data);
      })
      .catch(err => console.log('Failed to fetch books:', err));
  }, []);

  const handlePress = () => {
    haptics.light();
    router.push('/books' as any);
  };

  const book = books[0] || DEFAULT_BOOKS[0]; // Featured book

  return (
    <GlassCard style={styles.container}>
      <Pressable onPress={handlePress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}20` }]}>
              <Text style={{ fontSize: 18 }}>📚</Text>
            </View>
            <View>
              <Text style={[t.titleSmall, { color: colors.text }]}>Book Shelf</Text>
              <Text style={[t.caption, { color: colors.textTertiary }]}>
                {books.length} {books.length === 1 ? 'book' : 'books'} available
              </Text>
            </View>
          </View>
          <View style={[styles.chevronBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </View>
        </View>

        <LinearGradient
          colors={isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.01)']}
          style={styles.wiseCard}
        >
          <Ionicons name="sparkles" size={20} color={colors.primary} style={{ marginBottom: 8 }} />
          <Text style={[t.titleSmall, { color: colors.text, fontSize: 15, textAlign: 'center' }]}>
            "Reading books gives you wisdom that years alone cannot."
          </Text>
          <Text style={[t.caption, { color: colors.textTertiary, marginTop: 6, textAlign: 'center' }]}>
            Tap to explore your digital library
          </Text>
        </LinearGradient>
      </Pressable>
    </GlassCard>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wiseCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});

