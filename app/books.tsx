import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '@/src/theme/ThemeProvider';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { useHaptics } from '@/src/hooks/useHaptics';
import { DEFAULT_BOOKS, REMOTE_BOOKS_URL, Book } from '@/src/components/common/BookLibrary';

export default function BooksScreen() {
  const { colors, typography: t, isDark, borderRadius: br } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();
  const [books, setBooks] = useState<Book[]>(DEFAULT_BOOKS);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

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
    setSelectedBook(null); // Close modal before opening browser
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

  const handleBookPress = (book: Book) => {
    haptics.selection();
    setSelectedBook(book);
  };

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
                Tap on a book to view details
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
                onPress={() => handleBookPress(book)}
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
                    <View style={styles.bookListMeta}>
                      {book.pages && (
                        <View style={[styles.metaChip, { backgroundColor: `${colors.primary}15` }]}>
                          <Ionicons name="document-text-outline" size={12} color={colors.primary} />
                          <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                            {book.pages} pages
                          </Text>
                        </View>
                      )}
                      <View style={[styles.metaChip, { backgroundColor: `${colors.primary}15` }]}>
                        <Ionicons name="information-circle-outline" size={12} color={colors.primary} />
                        <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
                          Info
                        </Text>
                      </View>
                    </View>

                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
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

      {/* Book Detail Modal */}
      <Modal
        visible={!!selectedBook}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBook(null)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={Platform.OS === 'ios' ? 30 : 60} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedBook(null)} />
          
          <Animated.View 
            entering={SlideInUp.duration(400)}
            style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: br['2xl'] }]}
          >
            {selectedBook && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.modalCoverContainer, { shadowColor: selectedBook.color }]}>
                    <Image
                      source={{ uri: selectedBook.cover }}
                      style={styles.modalCover}
                      contentFit="cover"
                      placeholder={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                      transition={200}
                    />
                    {!selectedBook.cover && (
                      <View style={styles.placeholderOverlay}>
                        <Ionicons name="book-outline" size={40} color={colors.textTertiary} />
                      </View>
                    )}
                  </View>

                  <View style={styles.modalTitleSection}>
                    <Text style={[t.headlineSmall, { color: colors.text, textAlign: 'center' }]}>
                      {selectedBook.title}
                    </Text>
                    <Text style={[t.bodyMedium, { color: colors.textSecondary, marginTop: 4 }]}>
                      {selectedBook.author}
                    </Text>
                  </View>
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <Text style={[t.labelMedium, { color: colors.textSecondary, marginBottom: 8 }]}>
                    DESCRIPTION
                  </Text>
                  <Text style={[t.bodyMedium, { color: colors.text, lineHeight: 22 }]}>
                    {selectedBook.description || "No description available for this book."}
                  </Text>
                  
                  <View style={styles.modalStats}>
                    <View style={styles.modalStatItem}>
                      <Ionicons name="document-text" size={20} color={colors.primary} />
                      <Text style={[t.titleSmall, { color: colors.text, marginTop: 4 }]}>{selectedBook.pages || '---'}</Text>
                      <Text style={[t.caption, { color: colors.textTertiary }]}>Pages</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Ionicons name="language" size={20} color={colors.primary} />
                      <Text style={[t.titleSmall, { color: colors.text, marginTop: 4 }]}>English</Text>
                      <Text style={[t.caption, { color: colors.textTertiary }]}>Language</Text>
                    </View>
                    <View style={styles.modalStatItem}>
                      <Ionicons name="ribbon" size={20} color={colors.primary} />
                      <Text style={[t.titleSmall, { color: colors.text, marginTop: 4 }]}>Quality</Text>
                      <Text style={[t.caption, { color: colors.textTertiary }]}>HD PDF</Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <Pressable 
                    onPress={() => setSelectedBook(null)}
                    style={[styles.closeBtn, { backgroundColor: colors.backgroundSecondary }]}
                  >
                    <Text style={[t.labelMedium, { color: colors.textSecondary }]}>Close</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => handleOpenBook(selectedBook)}
                    style={[styles.readBtnLarge, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="book" size={18} color="#FFF" />
                    <Text style={[t.labelLarge, { color: '#FFF', marginLeft: 8 }]}>Read Now</Text>
                  </Pressable>
                </View>

              </>
            )}
          </Animated.View>
        </View>
      </Modal>
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
    width: 60,
    height: 85,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '100%',
    height: '80%',
    padding: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalCoverContainer: {
    width: 140,
    height: 200,
    borderRadius: 16,
    elevation: 15,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    marginBottom: 20,
  },
  modalCover: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  placeholderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
  },
  modalTitleSection: {

    alignItems: 'center',
    paddingHorizontal: 10,
  },
  modalScroll: {
    flex: 1,
    marginBottom: 20,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 10,
  },
  closeBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readBtnLarge: {
    flex: 2,
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

