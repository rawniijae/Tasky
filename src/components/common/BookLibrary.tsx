import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
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
  cover: any; // require() image
  pdfUrl: string;
  color: string;
  pages?: number;
  description?: string;
}

export const BOOKS: Book[] = [
  {
    id: 'ikigai',
    title: 'Ikigai',
    author: 'Héctor García & Francesc Miralles',
    cover: require('@/assets/books/ikigai_cover.png'),
    pdfUrl: 'https://raw.githubusercontent.com/ThisIsSakshi/Books/master/Timepass%20%F0%9F%A4%97/Ikigai.pdf',
    color: '#E8915B',
    pages: 194,
    description: 'The Japanese Secret to a Long and Happy Life',
  },
];

export function BookLibrary() {
  const { colors, typography: t, isDark } = useTheme();
  const router = useRouter();
  const haptics = useHaptics();

  const handlePress = () => {
    haptics.light();
    router.push('/books' as any);
  };

  const book = BOOKS[0]; // Featured book

  return (
    <GlassCard style={styles.container}>
      <Pressable onPress={handlePress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBadge, { backgroundColor: `${book.color}20` }]}>
              <Text style={{ fontSize: 18 }}>📚</Text>
            </View>
            <View>
              <Text style={[t.titleSmall, { color: colors.text }]}>Book Shelf</Text>
              <Text style={[t.caption, { color: colors.textTertiary }]}>
                {BOOKS.length} {BOOKS.length === 1 ? 'book' : 'books'} available
              </Text>
            </View>
          </View>
          <View style={[styles.chevronBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </View>
        </View>

        {/* Featured Book Card */}
        <View style={[styles.bookCard, { backgroundColor: `${book.color}${isDark ? '18' : '10'}`, borderColor: `${book.color}35` }]}>
          <Image
            source={book.cover}
            style={styles.bookCover}
            resizeMode="cover"
          />
          <View style={styles.bookInfo}>
            <Text style={[t.titleSmall, { color: colors.text, fontSize: 15 }]} numberOfLines={1}>
              {book.title}
            </Text>
            <Text style={[t.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
              {book.author}
            </Text>
            {book.description && (
              <Text style={[t.caption, { color: colors.textTertiary, marginTop: 4, fontSize: 11, lineHeight: 15 }]} numberOfLines={2}>
                {book.description}
              </Text>
            )}
            <View style={styles.bookMeta}>
              {book.pages && (
                <View style={[styles.metaBadge, { backgroundColor: `${book.color}25` }]}>
                  <Ionicons name="document-text-outline" size={11} color={book.color} />
                  <Text style={[{ color: book.color, fontSize: 10, fontWeight: '600', marginLeft: 3 }]}>
                    {book.pages} pages
                  </Text>
                </View>
              )}
              <View style={[styles.metaBadge, { backgroundColor: `${book.color}25` }]}>
                <Ionicons name="book-outline" size={11} color={book.color} />
                <Text style={[{ color: book.color, fontSize: 10, fontWeight: '600', marginLeft: 3 }]}>
                  Read Now
                </Text>
              </View>
            </View>
          </View>
        </View>
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
  bookCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  bookCover: {
    width: 60,
    height: 85,
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
  },
  bookMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
});
