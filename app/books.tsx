import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '@/src/theme/ThemeProvider';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { useHaptics } from '@/src/hooks/useHaptics';
import { DEFAULT_BOOKS, REMOTE_BOOKS_URL, Book } from '@/src/components/common/BookLibrary';

export default function BooksScreen() {
  const { colors, typography: t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
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

  const handleOpenBook = useCallback(async (book: Book) => {
    haptics.medium();
    // Use Google Docs viewer for the PDF — opens in an in-app browser
    const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(book.pdfUrl)}`;
    await WebBrowser.openBrowserAsync(googleDocsUrl, {
      toolbarColor: isDark ? '#111111' : '#FFFFFF',
      controlsColor: colors.primary,
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  }, [haptics, isDark, colors.primary]);

  const handleBack = useCallback(() => {
    haptics.light();
    router.back();
  }, [haptics, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        decelerationRate={Platform.OS === 'android' ? 0.985 : 'normal'}
        overScrollMode="never"
      >
        {/* Header */}
        <View style={[styles.screenHeader, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[t.headlineLarge, { color: colors.text }]}>Book Shelf</Text>
            <Text style={[t.bodySmall, { color: colors.textTertiary, marginTop: 2 }]}>
              Read anytime, anywhere 📖
            </Text>
          </View>
        </View>

        {/* Stats Banner */}
        <Animated.View entering={FadeIn.duration(300)} style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <LinearGradient
            colors={['#E8915B', '#D4714A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsBanner}
          >
            <View style={styles.statsIcon}>
              <Text style={{ fontSize: 28 }}>📚</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[t.titleSmall, { color: '#FFF' }]}>
                {books.length} {books.length === 1 ? 'Book' : 'Books'} Available
              </Text>
              <Text style={[t.caption, { color: 'rgba(255,255,255,0.8)', marginTop: 2 }]}>
                Tap on a book to start reading
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Book List */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={[t.labelMedium, { color: colors.textSecondary, marginBottom: 12 }]}>
            LIBRARY
          </Text>
          {books.map((book, index) => (
            <Animated.View
              key={book.id}
              entering={FadeInDown.delay(100 + index * 80).duration(400)}
            >
              <Pressable
                onPress={() => handleOpenBook(book)}
                style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
              >
                <GlassCard style={styles.bookListCard} animate={false}>
                  <Image
                    source={{ uri: book.cover }}
                    style={styles.bookListCover}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.bookListInfo}>
                    <Text style={[t.titleSmall, { color: colors.text, fontSize: 16 }]} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={[t.caption, { color: colors.textSecondary, marginTop: 3 }]} numberOfLines={1}>
                      {book.author}
                    </Text>
                    {book.description && (
                      <Text
                        style={[t.caption, { color: colors.textTertiary, marginTop: 6, fontSize: 11, lineHeight: 16 }]}
                        numberOfLines={2}
                      >
                        {book.description}
                      </Text>
                    )}
                    <View style={styles.bookListMeta}>
                      {book.pages && (
                        <View style={[styles.metaChip, { backgroundColor: `${book.color}18` }]}>
                          <Ionicons name="document-text-outline" size={12} color={book.color} />
                          <Text style={{ color: book.color, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                            {book.pages} pages
                          </Text>
                        </View>
                      )}
                      <View style={[styles.metaChip, { backgroundColor: `${book.color}18` }]}>
                        <Ionicons name="cloud-download-outline" size={12} color={book.color} />
                        <Text style={{ color: book.color, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                          PDF
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.readBtnContainer}>
                    <LinearGradient
                      colors={[book.color, `${book.color}CC`]}
                      style={styles.readBtn}
                    >
                      <Ionicons name="book" size={14} color="#FFF" />
                      <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700', marginLeft: 4 }}>
                        Read
                      </Text>
                    </LinearGradient>
                  </View>
                </GlassCard>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Add More Hint */}
        <View style={styles.addMoreHint}>
          <View style={[styles.addMoreDot, { backgroundColor: colors.backgroundTertiary }]}>
            <Ionicons name="add" size={20} color={colors.textTertiary} />
          </View>
          <Text style={[t.caption, { color: colors.textTertiary, marginTop: 8 }]}>
            More books coming soon...
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    gap: 14,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookListCard: {
    flexDirection: 'row',
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  bookListCover: {
    width: 70,
    height: 100,
    borderRadius: 10,
  },
  bookListInfo: {
    flex: 1,
    marginLeft: 14,
  },
  bookListMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  readBtnContainer: {
    marginLeft: 8,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addMoreHint: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 20,
  },
  addMoreDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
