import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { TransactionType, TransactionCategory } from '@/types';
import { saveTransaction, generateId } from '@/lib/storage';

interface AddTransactionScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const categories: { value: TransactionCategory; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { value: 'materials', label: 'Materials', icon: 'package' },
  { value: 'labor', label: 'Labor', icon: 'users' },
  { value: 'equipment', label: 'Equipment', icon: 'tool' },
  { value: 'other', label: 'Other', icon: 'more-horizontal' },
];

export default function AddTransactionScreen({ navigation }: AddTransactionScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('materials');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || !description) return;

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await saveTransaction({
        id: generateId(),
        type,
        amount: parseFloat(amount),
        category: type === 'income' ? 'income' : category,
        description,
        date,
        createdAt: new Date().toISOString(),
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error saving transaction:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryColor = (cat: TransactionCategory) => {
    switch (cat) {
      case 'materials': return theme.categoryMaterials;
      case 'labor': return theme.categoryLabor;
      case 'equipment': return theme.categoryEquipment;
      default: return theme.categoryOther;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <SegmentedControl
        options={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
        ]}
        value={type}
        onChange={setType}
      />

      <View style={[styles.amountContainer, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="h2" style={{ color: theme.textSecondary }}>
          {'\u20B9'}
        </ThemedText>
        <InputField
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="numeric"
          style={styles.amountInput}
          testID="input-amount"
        />
      </View>

      <InputField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What was this for?"
        testID="input-description"
      />

      <InputField
        label="Date"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        testID="input-date"
      />

      {type === 'expense' ? (
        <>
          <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
            Category
          </ThemedText>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const isSelected = category === cat.value;
              const color = getCategoryColor(cat.value);
              return (
                <Pressable
                  key={cat.value}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(cat.value);
                  }}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: isSelected ? `${color}20` : theme.backgroundSecondary,
                      borderColor: isSelected ? color : 'transparent',
                    },
                  ]}
                  testID={`category-${cat.value}`}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: `${color}30` }]}>
                    <Feather name={cat.icon} size={20} color={color} />
                  </View>
                  <ThemedText
                    type="small"
                    style={[styles.categoryLabel, { color: isSelected ? color : theme.text }]}
                  >
                    {cat.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <Pressable
        onPress={handleSave}
        disabled={saving || !amount || !description}
        style={[
          styles.saveButton,
          {
            backgroundColor: type === 'income' ? theme.success : theme.primary,
            opacity: saving || !amount || !description ? 0.5 : 1,
          },
        ]}
        testID="button-save"
      >
        <ThemedText type="body" style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Transaction'}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 0,
    backgroundColor: 'transparent',
    height: 56,
  },
  label: {
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  categoryItem: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  categoryLabel: {
    fontWeight: '500',
  },
  saveButton: {
    height: 52,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
