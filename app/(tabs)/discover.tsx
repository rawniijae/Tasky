import React from 'react';
import { View, ScrollView, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Header } from '@/src/components/common/Header';
import { QuickLinks } from '@/src/components/common/QuickLinks';
import { DailyRiddle } from '@/src/components/common/DailyRiddle';
import { PuzzleCard } from '@/src/components/puzzle/PuzzleCard';
import { FidgetSpinner } from '@/src/components/common/FidgetSpinner';
import { BookLibrary } from '@/src/components/common/BookLibrary';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function DiscoverScreen() {

  const { colors, typography: t, spacing: sp } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          decelerationRate={Platform.OS === 'android' ? 0.985 : 'normal'}
          overScrollMode="never"
        >
          <Header subtitle="Explore tools & fun" />

          <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
            <Text style={[t.labelMedium, { color: colors.textSecondary, marginHorizontal: 20, marginBottom: 8 }]}>
              READING
            </Text>
            <BookLibrary />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
            <Text style={[t.labelMedium, { color: colors.textSecondary, marginHorizontal: 20, marginBottom: 8 }]}>
              RESOURCES
            </Text>
            <QuickLinks />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <Text style={[t.labelMedium, { color: colors.textSecondary, marginHorizontal: 20, marginBottom: 8 }]}>
              DAILY CHALLENGE
            </Text>
            <DailyRiddle />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <Text style={[t.labelMedium, { color: colors.textSecondary, marginHorizontal: 20, marginBottom: 8 }]}>
              COLLECTION
            </Text>
            <PuzzleCard />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
            <Text style={[t.labelMedium, { color: colors.textSecondary, marginHorizontal: 20, marginBottom: 8 }]}>
              PLAYGROUND
            </Text>
            <FidgetSpinner />
          </Animated.View>
          
          <View style={styles.comingSoon}>
            <Text style={[t.bodySmall, { color: colors.textTertiary }]}>More coming soon...</Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  comingSoon: {
    marginTop: 40,
    alignItems: 'center',
  },
});
