import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MandatoryUpdateOverlay } from '@/src/components/ui/MandatoryUpdateOverlay';

// Create a custom navigator that supports swiping between screens
const { Navigator } = createMaterialTopTabNavigator();
const MaterialTabs = withLayoutContext(Navigator);

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
    </AnimatedIcon>
  );
}

export default function TabLayout() {
  const { colors, typography: t } = useTheme();
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();

  return (
    <MaterialTabs
      tabBarPosition="bottom"
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          textTransform: 'none',
          fontFamily: 'Inter_500Medium',
          marginTop: -2,
          marginBottom: 4,
        },
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
          height: 3,
          borderRadius: 3,
          // Position the indicator at the very top of the tab bar
          top: 0,
          width: '10%',
          left: '5%',
        },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 0.5,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        tabBarItemStyle: {
          height: 60,
          paddingTop: 8,
        },
        tabBarPressColor: 'transparent',
      }}
    >
      <MaterialTabs.Screen
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
      <MaterialTabs.Screen
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
      <MaterialTabs.Screen
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
      <MaterialTabs.Screen
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
      <MaterialTabs.Screen
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
      <MandatoryUpdateOverlay />
    </MaterialTabs>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 4,
  },
});
