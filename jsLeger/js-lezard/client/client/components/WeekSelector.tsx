import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { formatWeekRange } from '@/lib/storage';

interface WeekSelectorProps {
  weekStart: string;
  onChange: (weekStart: string) => void;
}

export function WeekSelector({ weekStart, onChange }: WeekSelectorProps) {
  const { theme } = useTheme();

  const goToPreviousWeek = () => {
    Haptics.selectionAsync();
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    onChange(d.toISOString().split('T')[0]);
  };

  const goToNextWeek = () => {
    Haptics.selectionAsync();
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    onChange(d.toISOString().split('T')[0]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <Pressable onPress={goToPreviousWeek} style={styles.arrow} testID="week-prev">
        <Feather name="chevron-left" size={24} color={theme.text} />
      </Pressable>
      <View style={styles.dateContainer}>
        <ThemedText type="body" style={styles.dateText}>
          {formatWeekRange(weekStart)}
        </ThemedText>
      </View>
      <Pressable onPress={goToNextWeek} style={styles.arrow} testID="week-next">
        <Feather name="chevron-right" size={24} color={theme.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
  },
  arrow: {
    padding: Spacing.sm,
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontWeight: '500',
  },
});
