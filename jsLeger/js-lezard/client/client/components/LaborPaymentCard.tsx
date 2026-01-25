import React from 'react';
import { StyleSheet, View, Pressable, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { LaborPayment } from '@/types';
import { formatCurrency } from '@/lib/storage';

interface LaborPaymentCardProps {
  payment: LaborPayment;
  onPress?: () => void;
  onTogglePaid?: (isPaid: boolean) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function LaborPaymentCard({ payment, onPress, onTogglePaid }: LaborPaymentCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTogglePaid?.(value);
  };

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
      testID={`labor-card-${payment.id}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${theme.categoryLabor}20` }]}>
        <Feather name="user" size={20} color={theme.categoryLabor} />
      </View>
      <View style={styles.content}>
        <ThemedText type="body" style={styles.name} numberOfLines={1}>
          {payment.workerName}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {payment.hoursWorked} hrs @ {formatCurrency(payment.hourlyRate)}/hr
        </ThemedText>
      </View>
      <View style={styles.rightContent}>
        <ThemedText type="h4" style={[styles.amount, { color: theme.secondary }]}>
          {formatCurrency(payment.totalAmount)}
        </ThemedText>
        <View style={styles.paidRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginRight: Spacing.xs }}>
            Paid
          </ThemedText>
          <Switch
            value={payment.isPaid}
            onValueChange={handleToggle}
            trackColor={{ false: theme.border, true: `${theme.success}80` }}
            thumbColor={payment.isPaid ? theme.success : theme.textSecondary}
            ios_backgroundColor={theme.border}
          />
        </View>
      </View>
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
  name: {
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  paidRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
