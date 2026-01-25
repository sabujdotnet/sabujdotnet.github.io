import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Transaction, TransactionCategory } from '@/types';
import { formatCurrency, formatDate } from '@/lib/storage';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

const categoryIcons: Record<TransactionCategory, keyof typeof Feather.glyphMap> = {
  materials: 'package',
  labor: 'users',
  equipment: 'tool',
  other: 'more-horizontal',
  income: 'trending-up',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const categoryColor = isDark
    ? theme[`category${transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}` as keyof typeof theme] || theme.categoryOther
    : theme[`category${transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}` as keyof typeof theme] || theme.categoryOther;

  const amountColor = transaction.type === 'income' ? theme.success : theme.error;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
      testID={`transaction-card-${transaction.id}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}20` }]}>
        <Feather
          name={categoryIcons[transaction.category]}
          size={20}
          color={categoryColor as string}
        />
      </View>
      <View style={styles.content}>
        <ThemedText type="body" style={styles.description} numberOfLines={1}>
          {transaction.description}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {formatDate(transaction.date)} • {transaction.category}
        </ThemedText>
      </View>
      <ThemedText
        type="h4"
        style={[styles.amount, { color: amountColor }]}
      >
        {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  description: {
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  amount: {
    fontWeight: '600',
  },
});
