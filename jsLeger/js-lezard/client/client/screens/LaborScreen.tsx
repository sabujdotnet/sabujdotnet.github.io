import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ThemedText } from '@/components/ThemedText';
import { LaborPaymentCard } from '@/components/LaborPaymentCard';
import { WeekSelector } from '@/components/WeekSelector';
import { SummaryCard } from '@/components/SummaryCard';
import { FAB } from '@/components/FAB';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/theme';
import { LaborPayment } from '@/types';
import { getLaborPayments, saveLaborPayment, getWeekStart, formatCurrency } from '@/lib/storage';

interface LaborScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function LaborScreen({ navigation }: LaborScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [payments, setPayments] = useState<LaborPayment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const allPayments = await getLaborPayments();
    const weekPayments = allPayments.filter(p => p.weekStart === weekStart);
    setPayments(weekPayments);
  }, [weekStart]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTogglePaid = async (payment: LaborPayment, isPaid: boolean) => {
    const updatedPayment = { ...payment, isPaid };
    await saveLaborPayment(updatedPayment);
    await loadData();
  };

  const totalPayroll = payments.reduce((sum, p) => sum + p.totalAmount, 0);
  const paidAmount = payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.totalAmount, 0);
  const unpaidAmount = totalPayroll - paidAmount;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing['4xl'],
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <WeekSelector weekStart={weekStart} onChange={setWeekStart} />

        <View style={styles.summaryRow}>
          <SummaryCard
            title="Total Payroll"
            amount={totalPayroll}
            icon="dollar-sign"
            color={theme.secondary}
          />
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard
            title="Paid"
            amount={paidAmount}
            icon="check-circle"
            color={theme.success}
          />
          <View style={{ width: Spacing.sm }} />
          <SummaryCard
            title="Unpaid"
            amount={unpaidAmount}
            icon="clock"
            color={theme.warning}
          />
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="h4">Staff Payments</ThemedText>
        </View>

        {payments.length > 0 ? (
          payments.map(payment => (
            <LaborPaymentCard
              key={payment.id}
              payment={payment}
              onPress={() => navigation.navigate('PaymentDetail', { payment })}
              onTogglePaid={(isPaid) => handleTogglePaid(payment, isPaid)}
            />
          ))
        ) : (
          <EmptyState
            image={require('../../assets/images/empty-labor.png')}
            title="No payments this week"
            description="Tap the + button to log a payment"
          />
        )}
      </ScrollView>

      <FAB
        icon="plus"
        onPress={() => navigation.navigate('AddPayment', { weekStart })}
        style={{ bottom: tabBarHeight + Spacing.lg }}
        testID="add-payment-fab"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  sectionHeader: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
});
