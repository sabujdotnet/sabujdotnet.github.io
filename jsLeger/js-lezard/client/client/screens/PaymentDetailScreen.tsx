import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { LaborPayment } from '@/types';
import { deleteLaborPayment, saveLaborPayment, formatCurrency, formatWeekRange } from '@/lib/storage';

interface PaymentDetailScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ params: { payment: LaborPayment } }, 'params'>;
}

export default function PaymentDetailScreen({ navigation, route }: PaymentDetailScreenProps) {
  const { payment: initialPayment } = route.params;
  const [payment, setPayment] = useState(initialPayment);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [deleting, setDeleting] = useState(false);

  const handleTogglePaid = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updatedPayment = { ...payment, isPaid: !payment.isPaid };
    await saveLaborPayment(updatedPayment);
    setPayment(updatedPayment);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this payment record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            try {
              await deleteLaborPayment(payment.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting payment:', error);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${theme.categoryLabor}20` }]}>
          <Feather name="user" size={32} color={theme.categoryLabor} />
        </View>
        <ThemedText type="h2" style={styles.workerName}>
          {payment.workerName}
        </ThemedText>
        <ThemedText type="h1" style={{ color: theme.secondary }}>
          {formatCurrency(payment.totalAmount)}
        </ThemedText>
        <View style={[
          styles.statusBadge,
          { backgroundColor: payment.isPaid ? `${theme.success}20` : `${theme.warning}20` },
        ]}>
          <Feather
            name={payment.isPaid ? 'check-circle' : 'clock'}
            size={14}
            color={payment.isPaid ? theme.success : theme.warning}
          />
          <ThemedText
            type="small"
            style={{
              color: payment.isPaid ? theme.success : theme.warning,
              marginLeft: Spacing.xs,
              fontWeight: '600',
            }}
          >
            {payment.isPaid ? 'Paid' : 'Pending'}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.detailCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.detailRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Week
          </ThemedText>
          <ThemedText type="body" style={styles.detailValue}>
            {formatWeekRange(payment.weekStart)}
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <View style={styles.detailRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Hours Worked
          </ThemedText>
          <ThemedText type="body" style={styles.detailValue}>
            {payment.hoursWorked} hours
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <View style={styles.detailRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Hourly Rate
          </ThemedText>
          <ThemedText type="body" style={styles.detailValue}>
            {formatCurrency(payment.hourlyRate)}/hr
          </ThemedText>
        </View>
        
        {payment.notes ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.detailRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Notes
              </ThemedText>
              <ThemedText type="body" style={[styles.detailValue, { flex: 1, textAlign: 'right' }]}>
                {payment.notes}
              </ThemedText>
            </View>
          </>
        ) : null}
      </View>

      <Pressable
        onPress={handleTogglePaid}
        style={[
          styles.actionButton,
          { backgroundColor: payment.isPaid ? theme.backgroundDefault : theme.success },
        ]}
        testID="toggle-paid"
      >
        <Feather
          name={payment.isPaid ? 'x-circle' : 'check-circle'}
          size={20}
          color={payment.isPaid ? theme.text : '#FFFFFF'}
        />
        <ThemedText
          type="body"
          style={[
            styles.actionButtonText,
            { color: payment.isPaid ? theme.text : '#FFFFFF' },
          ]}
        >
          {payment.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={handleDelete}
        disabled={deleting}
        style={[styles.deleteButton, { backgroundColor: `${theme.error}15` }]}
        testID="button-delete"
      >
        <Feather name="trash-2" size={20} color={theme.error} />
        <ThemedText type="body" style={[styles.deleteButtonText, { color: theme.error }]}>
          {deleting ? 'Deleting...' : 'Delete Payment'}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing['2xl'],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  workerName: {
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  detailCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  detailValue: {
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  actionButtonText: {
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  deleteButtonText: {
    fontWeight: '600',
  },
});
