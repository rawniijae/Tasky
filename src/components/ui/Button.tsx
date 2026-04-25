import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useHaptics } from '@/src/hooks/useHaptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const { colors, typography: t, borderRadius: br, spacing: sp } = useTheme();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    haptics.light();
    onPress();
  };

  const sizeStyles: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; iconSize: number }> = {
    sm: { height: 36, paddingHorizontal: sp.md, fontSize: 13, iconSize: 16 },
    md: { height: 44, paddingHorizontal: sp.lg, fontSize: 15, iconSize: 18 },
    lg: { height: 52, paddingHorizontal: sp.xl, fontSize: 16, iconSize: 20 },
  };

  const s = sizeStyles[size];

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; iconColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          container: {},
          text: { color: '#FFFFFF', fontFamily: t.labelLarge.fontFamily, fontSize: s.fontSize },
          iconColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.backgroundSecondary,
            borderWidth: 1,
            borderColor: colors.border,
          },
          text: { color: colors.text, fontFamily: t.labelLarge.fontFamily, fontSize: s.fontSize },
          iconColor: colors.text,
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colors.primary, fontFamily: t.labelLarge.fontFamily, fontSize: s.fontSize },
          iconColor: colors.primary,
        };
      case 'danger':
        return {
          container: { backgroundColor: colors.danger },
          text: { color: '#FFFFFF', fontFamily: t.labelLarge.fontFamily, fontSize: s.fontSize },
          iconColor: '#FFFFFF',
        };
      case 'glass':
        return {
          container: {
            backgroundColor: colors.glassBg,
            borderWidth: 1,
            borderColor: colors.glassBorder,
          },
          text: { color: colors.text, fontFamily: t.labelLarge.fontFamily, fontSize: s.fontSize },
          iconColor: colors.text,
        };
      default:
        return {
          container: {},
          text: { color: '#FFFFFF', fontFamily: t.labelLarge.fontFamily, fontSize: s.fontSize },
          iconColor: '#FFFFFF',
        };
    }
  };

  const variantStyles = getVariantStyles();

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color as string}
          style={{ marginRight: sp.sm }}
        />
      ) : icon && iconPosition === 'left' ? (
        <Ionicons
          name={icon}
          size={s.iconSize}
          color={variantStyles.iconColor}
          style={{ marginRight: sp.sm }}
        />
      ) : null}
      <Text style={[variantStyles.text, disabled && { opacity: 0.5 }]}>{title}</Text>
      {icon && iconPosition === 'right' && !loading ? (
        <Ionicons
          name={icon}
          size={s.iconSize}
          color={variantStyles.iconColor}
          style={{ marginLeft: sp.sm }}
        />
      ) : null}
    </>
  );

  const containerStyle: ViewStyle = {
    height: s.height,
    paddingHorizontal: s.paddingHorizontal,
    borderRadius: br.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullWidth ? { width: '100%' } : {}),
    ...(disabled ? { opacity: 0.5 } : {}),
    ...variantStyles.container,
  };

  if (variant === 'primary' && !disabled) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[animatedStyle, style]}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={containerStyle}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[animatedStyle, containerStyle, style]}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}
