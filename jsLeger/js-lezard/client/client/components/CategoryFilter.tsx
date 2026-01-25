import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { TransactionCategory } from '@/types';

interface CategoryFilterProps {
  value: TransactionCategory | 'all';
  onChange: (value: TransactionCategory | 'all') => void;
}

const categories: { value: TransactionCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'materials', label: 'Materials' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' },
];

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { theme } = useTheme();

  const handlePress = (category: TransactionCategory | 'all') => {
    Haptics.selectionAsync();
    onChange(category);
  };

  const getCategoryColor = (category: TransactionCategory | 'all') => {
    switch (category) {
      case 'materials': return theme.categoryMaterials;
      case 'labor': return theme.categoryLabor;
      case 'equipment': return theme.categoryEquipment;
      case 'income': return theme.success;
      default: return theme.primary;
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const isSelected = value === category.value;
        const color = getCategoryColor(category.value);
        
        return (
          <Pressable
            key={category.value}
            onPress={() => handlePress(category.value)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? `${color}20` : theme.backgroundSecondary,
                borderColor: isSelected ? color : 'transparent',
              },
            ]}
            testID={`filter-${category.value}`}
          >
            <ThemedText
              type="small"
              style={[
                styles.label,
                { color: isSelected ? color : theme.textSecondary },
              ]}
            >
              {category.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  label: {
    fontWeight: '500',
  },
});
