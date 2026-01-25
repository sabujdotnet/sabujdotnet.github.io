import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { PeriodFilter } from '@/types';

interface PeriodSelectorProps {
  value: PeriodFilter;
  onChange: (value: PeriodFilter) => void;
}

const periods: { value: PeriodFilter; label: string }[] = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const { theme } = useTheme();

  const handlePress = (period: PeriodFilter) => {
    Haptics.selectionAsync();
    onChange(period);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      {periods.map((period) => (
        <Pressable
          key={period.value}
          onPress={() => handlePress(period.value)}
          style={[
            styles.option,
            value === period.value && { backgroundColor: theme.backgroundDefault },
          ]}
          testID={`period-${period.value}`}
        >
          <ThemedText
            type="small"
            style={[
              styles.label,
              { color: value === period.value ? theme.primary : theme.textSecondary },
            ]}
          >
            {period.label}
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
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
  },
});
