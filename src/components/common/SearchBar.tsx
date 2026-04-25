import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useHaptics } from '@/src/hooks/useHaptics';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search tasks...',
}: SearchBarProps) {
  const { colors, typography: t, borderRadius: br, spacing: sp } = useTheme();
  const haptics = useHaptics();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.inputBg,
          borderColor: isFocused ? colors.inputFocusBorder : colors.inputBorder,
          borderRadius: br.lg,
        },
      ]}
    >
      <Ionicons
        name="search-outline"
        size={18}
        color={isFocused ? colors.primary : colors.placeholder}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          t.bodyMedium,
          { color: colors.text },
        ]}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => {
            haptics.light();
            onChangeText('');
          }}
        >
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    marginHorizontal: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    height: '100%',
  },
});
