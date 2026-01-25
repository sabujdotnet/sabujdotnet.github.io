import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface MoreScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  screen: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'plugins',
    title: 'Plugins',
    description: 'Browse and install extensions',
    icon: 'grid',
    screen: 'Plugins',
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'View financial reports and charts',
    icon: 'bar-chart-2',
    screen: 'Reports',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'App preferences and backup',
    icon: 'settings',
    screen: 'Settings',
  },
];

export default function MoreScreen({ navigation }: MoreScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const handlePress = (screen: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(screen);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      {menuItems.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => handlePress(item.screen)}
          style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: theme.backgroundDefault },
            pressed && { opacity: 0.8 },
          ]}
          testID={`menu-${item.id}`}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}20` }]}>
            <Feather name={item.icon} size={22} color={theme.primary} />
          </View>
          <View style={styles.menuContent}>
            <ThemedText type="body" style={styles.menuTitle}>
              {item.title}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.description}
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      ))}

      <View style={styles.footer}>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
          BuildLedger v1.0.0
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.xs }}>
          Construction Financial Tracker
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  footer: {
    marginTop: Spacing['3xl'],
    paddingVertical: Spacing.xl,
  },
});
