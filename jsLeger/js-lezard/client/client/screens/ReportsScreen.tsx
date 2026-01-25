import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { PeriodSelector } from '@/components/PeriodSelector';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { PeriodFilter, Transaction, TransactionCategory } from '@/types';
import { getTransactions, formatCurrency } from '@/lib/storage';

interface CategoryData {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  color: string;
}

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();

  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

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

    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalIncome(income);
    setTotalExpenses(expenses);

    const categoryTotals = filtered
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const categoryColors: Record<string, string> = {
      materials: isDark ? theme.categoryMaterials : '#FFA726',
      labor: isDark ? theme.categoryLabor : '#42A5F5',
      equipment: isDark ? theme.categoryEquipment : '#78909C',
      other: isDark ? theme.categoryOther : '#9E9E9E',
    };

    const data: CategoryData[] = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category: category as TransactionCategory,
        amount,
        percentage: expenses > 0 ? (amount / expenses) * 100 : 0,
        color: categoryColors[category] || theme.categoryOther,
      }))
      .sort((a, b) => b.amount - a.amount);

    setCategoryData(data);
  }, [period, isDark, theme]);

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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <PeriodSelector value={period} onChange={setPeriod} />

      <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="h4" style={styles.cardTitle}>Overview</ThemedText>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: `${theme.success}20` }]}>
              <Feather name="trending-up" size={18} color={theme.success} />
            </View>
            <View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Income</ThemedText>
              <ThemedText type="h4" style={{ color: theme.success }}>{formatCurrency(totalIncome)}</ThemedText>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: `${theme.error}20` }]}>
              <Feather name="trending-down" size={18} color={theme.error} />
            </View>
            <View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Expenses</ThemedText>
              <ThemedText type="h4" style={{ color: theme.error }}>{formatCurrency(totalExpenses)}</ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.profitRow, { borderTopColor: theme.border }]}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>Net Profit</ThemedText>
          <ThemedText
            type="h3"
            style={{ color: totalIncome - totalExpenses >= 0 ? theme.success : theme.error }}
          >
            {totalIncome - totalExpenses >= 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpenses)}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>Expense Breakdown</ThemedText>

      {categoryData.length > 0 ? (
        <View style={[styles.breakdownCard, { backgroundColor: theme.backgroundDefault }]}>
          {categoryData.map((item) => (
            <View key={item.category} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                <ThemedText type="body" style={styles.categoryName}>
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </ThemedText>
              </View>
              <View style={styles.categoryValues}>
                <ThemedText type="body" style={styles.categoryAmount}>
                  {formatCurrency(item.amount)}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {item.percentage.toFixed(1)}%
                </ThemedText>
              </View>
            </View>
          ))}

          <View style={[styles.barContainer, { backgroundColor: theme.backgroundSecondary }]}>
            {categoryData.map((item, index) => (
              <View
                key={item.category}
                style={[
                  styles.barSegment,
                  {
                    backgroundColor: item.color,
                    width: `${item.percentage}%`,
                    borderTopLeftRadius: index === 0 ? 4 : 0,
                    borderBottomLeftRadius: index === 0 ? 4 : 0,
                    borderTopRightRadius: index === categoryData.length - 1 ? 4 : 0,
                    borderBottomRightRadius: index === categoryData.length - 1 ? 4 : 0,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="pie-chart" size={48} color={theme.textSecondary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
            No expense data for this period
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  cardTitle: {
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  sectionTitle: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
  breakdownCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  categoryName: {
    fontWeight: '500',
  },
  categoryValues: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontWeight: '600',
  },
  barContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
  emptyCard: {
    padding: Spacing['3xl'],
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
