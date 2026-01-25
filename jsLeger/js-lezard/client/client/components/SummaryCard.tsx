import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { formatCurrency } from '@/lib/storage';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  subtitle?: string;
}

export function SummaryCard({ title, amount, icon, color, subtitle }: SummaryCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
        {title}
      </ThemedText>
      <ThemedText type="h3" style={[styles.amount, { color }]}>
        {formatCurrency(amount)}
      </ThemedText>
      {subtitle ? (
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 140,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  amount: {
    fontWeight: '700',
  },
});
