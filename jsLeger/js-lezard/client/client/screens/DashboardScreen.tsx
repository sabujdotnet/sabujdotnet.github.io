import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ThemedText } from '@/components/ThemedText';
import { SummaryCard } from '@/components/SummaryCard';
import { PeriodSelector } from '@/components/PeriodSelector';
import { TransactionCard } from '@/components/TransactionCard';
import { FAB } from '@/components/FAB';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/theme';
import { Transaction, PeriodFilter, FinancialSummary } from '@/types';
import { getTransactions, formatCurrency } from '@/lib/storage';

interface DashboardScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    categoryBreakdown: { materials: 0, labor: 0, equipment: 0, other: 0, income: 0 },
  });

  const loadData = useCallback(async () => {
    const allTransactions = await getTransactions();
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const filtered = allTransactions.filter(t => new Date(t.date) >= startDate);
    setTransactions(filtered);

    const totalIncome = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = filtered.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    setSummary({
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      categoryBreakdown: categoryBreakdown as FinancialSummary['categoryBreakdown'],
    });
  }, [period]);

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

  const recentTransactions = transactions.slice(0, 5);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing['4xl'],
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <PeriodSelector value={period} onChange={setPeriod} />

        <View style={styles.summaryRow}>
          <SummaryCard
            title="Total Income"
            amount={summary.totalIncome}
            icon="trending-up"
            color={theme.success}
          />
          <View style={{ width: Spacing.sm }} />
          <SummaryCard
            title="Total Expenses"
            amount={summary.totalExpenses}
            icon="trending-down"
            color={theme.error}
          />
        </View>

        <View style={[styles.profitCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Net Profit
          </ThemedText>
          <ThemedText
            type="h1"
            style={{
              color: summary.netProfit >= 0 ? theme.success : theme.error,
              marginTop: Spacing.xs,
            }}
          >
            {summary.netProfit >= 0 ? '+' : ''}{formatCurrency(summary.netProfit)}
          </ThemedText>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="h4">Recent Transactions</ThemedText>
        </View>

        {recentTransactions.length > 0 ? (
          recentTransactions.map(transaction => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onPress={() => navigation.navigate('TransactionDetail', { transaction })}
            />
          ))
        ) : (
          <EmptyState
            image={require('../../assets/images/empty-dashboard.png')}
            title="No transactions yet"
            description="Tap the + button to add your first transaction"
          />
        )}
      </ScrollView>

      <FAB
        icon="plus"
        onPress={() => navigation.navigate('AddTransaction')}
        style={{ bottom: tabBarHeight + Spacing.lg }}
        testID="add-transaction-fab"
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
    marginTop: Spacing.lg,
  },
  profitCard: {
    marginTop: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  sectionHeader: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
});
