import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useHaptics } from '@/src/hooks/useHaptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

// Tab order matches the Tabs.Screen order below
const TAB_ROUTES = ['/', '/discover', '/calendar', '/focus', '/profile'] as const;
const TAB_INFO = [
  { title: 'Home', icon: 'home' as const },
  { title: 'Discover', icon: 'compass' as const },
  { title: 'Calendar', icon: 'calendar' as const },
  { title: 'Focus', icon: 'timer' as const },
  { title: 'Profile', icon: 'person' as const },
];

const AnimatedIcon = Animated.createAnimatedComponent(View);

function TabIcon({
  name,
  focused,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, {
      damping: 15,
      stiffness: 350,
    });
  }, [focused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedIcon style={animStyle}>
      <Ionicons name={name} size={24} color={color} />
      {focused && (
        <View style={[styles.activeDot, { backgroundColor: color }]} />
      )}
    </AnimatedIcon>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const haptics = useHaptics();
  const router = useRouter();
  const pathname = usePathname();

  const translateX = useSharedValue(0);
  const currentTabIndex = useSharedValue(0);
  const [tabIndex, setTabIndex] = useState(0); // React state for JSX rendering
  const isNavigating = useRef(false);

  useEffect(() => {
    let index = 0;
    if (pathname === '/' || pathname === '') {
      index = 0;
    } else {
      const found = TAB_ROUTES.findIndex((r) => r !== '/' && pathname === r);
      index = found >= 0 ? found : 0;
    }
    currentTabIndex.value = index;
    setTabIndex(index);
    // Reset position when we arrive at a new tab
    translateX.value = 0;
    isNavigating.current = false;
  }, [pathname]);

  const navigateToTab = useCallback(
    (index: number) => {
      if (isNavigating.current) return;
      if (index < 0 || index >= TAB_ROUTES.length) return;
      isNavigating.current = true;
      haptics.selection();
      router.navigate(TAB_ROUTES[index] as any);
    },
    [router, haptics]
  );

  const triggerHaptic = useCallback(() => {
    haptics.light();
  }, [haptics]);

  // Track if we already fired a haptic for this gesture pass-through
  const hapticFired = useSharedValue(false);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onBegin(() => {
      'worklet';
      hapticFired.value = false;
    })
    .onUpdate((e) => {
      'worklet';
      const idx = currentTabIndex.value;

      // Rubber-band at edges (first/last tab)
      if (idx === 0 && e.translationX > 0) {
        translateX.value = e.translationX * 0.15;
      } else if (idx === TAB_ROUTES.length - 1 && e.translationX < 0) {
        translateX.value = e.translationX * 0.15;
      } else {
        translateX.value = e.translationX;
      }

      // Fire haptic when crossing the threshold
      const pastThreshold =
        Math.abs(translateX.value) > SWIPE_THRESHOLD;
      if (pastThreshold && !hapticFired.value) {
        hapticFired.value = true;
        runOnJS(triggerHaptic)();
      } else if (!pastThreshold && hapticFired.value) {
        hapticFired.value = false;
      }
    })
    .onEnd((e) => {
      'worklet';
      const idx = currentTabIndex.value;
      const shouldNavigate =
        Math.abs(translateX.value) > SWIPE_THRESHOLD ||
        Math.abs(e.velocityX) > 800;

      if (shouldNavigate && translateX.value < 0 && idx < TAB_ROUTES.length - 1) {
        // Swipe left → slide off screen, then navigate
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 180 }, () => {
          runOnJS(navigateToTab)(idx + 1);
        });
      } else if (shouldNavigate && translateX.value > 0 && idx > 0) {
        // Swipe right → slide off screen, then navigate
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 180 }, () => {
          runOnJS(navigateToTab)(idx - 1);
        });
      } else {
        // Snap back
        translateX.value = withSpring(0, { damping: 25, stiffness: 350 });
      }
    });

  // Animate the main content following the finger
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Peek label: previous tab (appears when swiping right)
  const leftPeekStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH * 0.35],
      [0, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH * 0.4],
      [0.8, 1],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  // Peek label: next tab (appears when swiping left)
  const rightPeekStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SCREEN_WIDTH * 0.35, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [-SCREEN_WIDTH * 0.4, 0],
      [1, 0.8],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  const prevTab = tabIndex > 0 ? TAB_INFO[tabIndex - 1] : null;
  const nextTab = tabIndex < TAB_INFO.length - 1 ? TAB_INFO[tabIndex + 1] : null;

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Peek indicators behind the sliding content */}
        {prevTab && (
          <Animated.View style={[styles.peekContainer, styles.peekLeft, leftPeekStyle]}>
            <Ionicons name={prevTab.icon} size={36} color={colors.primary + '60'} />
            <Text style={[styles.peekText, { color: colors.primary + '80' }]}>
              {prevTab.title}
            </Text>
          </Animated.View>
        )}
        {nextTab && (
          <Animated.View style={[styles.peekContainer, styles.peekRight, rightPeekStyle]}>
            <Ionicons name={nextTab.icon} size={36} color={colors.primary + '60'} />
            <Text style={[styles.peekText, { color: colors.primary + '80' }]}>
              {nextTab.title}
            </Text>
          </Animated.View>
        )}

        {/* Main content that slides with finger */}
        <Animated.View style={[styles.content, contentStyle]}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: colors.tabActive,
              tabBarInactiveTintColor: colors.tabInactive,
              tabBarStyle: {
                position: 'absolute',
                backgroundColor: colors.tabBar,
                borderTopColor: colors.tabBarBorder,
                borderTopWidth: 0.5,
                height: Platform.OS === 'ios' ? 88 : 64,
                paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                paddingTop: 8,
                elevation: 0,
              },
              tabBarLabelStyle: {
                fontSize: 11,
                fontFamily: 'Inter_500Medium',
                marginTop: 2,
              },
            }}
            screenListeners={{
              tabPress: () => {
                haptics.selection();
              },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Home',
                tabBarIcon: ({ focused, color }) => (
                  <TabIcon
                    name={focused ? 'home' : 'home-outline'}
                    focused={focused}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="discover"
              options={{
                title: 'Discover',
                tabBarIcon: ({ focused, color }) => (
                  <TabIcon
                    name={focused ? 'compass' : 'compass-outline'}
                    focused={focused}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="calendar"
              options={{
                title: 'Calendar',
                tabBarIcon: ({ focused, color }) => (
                  <TabIcon
                    name={focused ? 'calendar' : 'calendar-outline'}
                    focused={focused}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="focus"
              options={{
                title: 'Focus',
                tabBarIcon: ({ focused, color }) => (
                  <TabIcon
                    name={focused ? 'timer' : 'timer-outline'}
                    focused={focused}
                    color={color}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: 'Profile',
                tabBarIcon: ({ focused, color }) => (
                  <TabIcon
                    name={focused ? 'person' : 'person-outline'}
                    focused={focused}
                    color={color}
                  />
                ),
              }}
            />
          </Tabs>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 4,
  },
  peekContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  peekLeft: {
    // Centered but slightly left
    paddingRight: '30%',
  },
  peekRight: {
    // Centered but slightly right
    paddingLeft: '30%',
  },
  peekText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
});
