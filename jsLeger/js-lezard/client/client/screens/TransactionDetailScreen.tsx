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
import { Transaction, TransactionCategory } from '@/types';
import { deleteTransaction, formatCurrency, formatDate } from '@/lib/storage';

interface TransactionDetailScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ params: { transaction: Transaction } }, 'params'>;
}

const categoryIcons: Record<TransactionCategory, keyof typeof Feather.glyphMap> = {
  materials: 'package',
  labor: 'users',
  equipment: 'tool',
  other: 'more-horizontal',
  income: 'trending-up',
};

export default function TransactionDetailScreen({ navigation, route }: TransactionDetailScreenProps) {
  const { transaction } = route.params;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [deleting, setDeleting] = useState(false);

  const categoryColor = theme[`category${transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}` as keyof typeof theme] || theme.categoryOther;
  const amountColor = transaction.type === 'income' ? theme.success : theme.error;

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            try {
              await deleteTransaction(transaction.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting transaction:', error);
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
        <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}20` }]}>
          <Feather
            name={categoryIcons[transaction.category]}
            size={32}
            color={categoryColor as string}
          />
        </View>
        <ThemedText type="h1" style={[styles.amount, { color: amountColor }]}>
          {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
        </ThemedText>
        <ThemedText type="body" style={styles.description}>
          {transaction.description}
        </ThemedText>
      </View>

      <View style={[styles.detailCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.detailRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Type
          </ThemedText>
          <ThemedText type="body" style={styles.detailValue}>
            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <View style={styles.detailRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Category
          </ThemedText>
          <View style={styles.categoryBadge}>
            <View style={[styles.categoryDot, { backgroundColor: categoryColor as string }]} />
            <ThemedText type="body" style={styles.detailValue}>
              {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <View style={styles.detailRow}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Date
          </ThemedText>
          <ThemedText type="body" style={styles.detailValue}>
            {formatDate(transaction.date)}
          </ThemedText>
        </View>
      </View>

      <Pressable
        onPress={handleDelete}
        disabled={deleting}
        style={[
          styles.deleteButton,
          { backgroundColor: `${theme.error}15` },
        ]}
        testID="button-delete"
      >
        <Feather name="trash-2" size={20} color={theme.error} />
        <ThemedText type="body" style={[styles.deleteButtonText, { color: theme.error }]}>
          {deleting ? 'Deleting...' : 'Delete Transaction'}
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
    marginBottom: Spacing.lg,
  },
  amount: {
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: 'center',
    opacity: 0.8,
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
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
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
