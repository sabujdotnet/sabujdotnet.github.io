import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ThemedText } from '@/components/ThemedText';
import { TransactionCard } from '@/components/TransactionCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { FAB } from '@/components/FAB';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/theme';
import { Transaction, TransactionCategory } from '@/types';
import { getTransactions, formatDate } from '@/lib/storage';

interface TransactionsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

interface GroupedTransactions {
  date: string;
  transactions: Transaction[];
}

export default function TransactionsScreen({ navigation }: TransactionsScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<TransactionCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const data = await getTransactions();
    setTransactions(data);
  }, []);

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

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(t => t.category === filter);

  const groupedTransactions: GroupedTransactions[] = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    const existingGroup = groups.find(g => g.date === date);
    if (existingGroup) {
      existingGroup.transactions.push(transaction);
    } else {
      groups.push({ date, transactions: [transaction] });
    }
    return groups;
  }, [] as GroupedTransactions[]);

  groupedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderItem = ({ item }: { item: GroupedTransactions }) => (
    <View style={styles.group}>
      <ThemedText type="small" style={[styles.dateHeader, { color: theme.textSecondary }]}>
        {formatDate(item.date)}
      </ThemedText>
      {item.transactions.map(transaction => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          onPress={() => navigation.navigate('TransactionDetail', { transaction })}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        style={styles.list}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing['4xl'],
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={groupedTransactions}
        keyExtractor={item => item.date}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.filterContainer}>
            <CategoryFilter value={filter} onChange={setFilter} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            image={require('../../assets/images/empty-transactions.png')}
            title="No transactions"
            description="Add your first income or expense to get started"
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

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
  list: {
    flex: 1,
  },
  filterContainer: {
    marginBottom: Spacing.lg,
  },
  group: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  dateHeader: {
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
