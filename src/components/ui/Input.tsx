import React, { useState, useRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';

const AnimatedView = Animated.createAnimatedComponent(View);

interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  icon,
  error,
  containerStyle,
  ...props
}: InputProps) {
  const { colors, typography: t, spacing: sp, borderRadius: br } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const borderAnimStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusAnim.value,
      [0, 1],
      [colors.inputBorder, colors.inputFocusBorder]
    ),
    borderWidth: 1.5,
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
    props.onBlur?.(e);
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={[
            t.labelMedium,
            {
              color: isFocused ? colors.primary : colors.textSecondary,
              marginBottom: sp.xs,
              marginLeft: sp.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <AnimatedView
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBg,
            borderRadius: br.lg,
          },
          borderAnimStyle,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? colors.primary : colors.placeholder}
            style={{ marginRight: sp.sm }}
          />
        )}
        <TextInput
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.placeholder}
          style={[
            styles.input,
            t.bodyMedium,
            { color: colors.text },
            props.multiline && { minHeight: 80, textAlignVertical: 'top' },
            props.style,
          ]}
        />
      </AnimatedView>
      {error && (
        <Text
          style={[
            t.caption,
            { color: colors.danger, marginTop: sp.xs, marginLeft: sp.xs },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
});
