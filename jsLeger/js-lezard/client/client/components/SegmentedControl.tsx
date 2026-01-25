import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { theme } = useTheme();

  const handlePress = (option: T) => {
    Haptics.selectionAsync();
    onChange(option);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => handlePress(option.value)}
          style={[
            styles.option,
            value === option.value && { backgroundColor: theme.primary },
          ]}
          testID={`segment-${option.value}`}
        >
          <ThemedText
            type="body"
            style={[
              styles.label,
              { color: value === option.value ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            {option.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
  },
});
