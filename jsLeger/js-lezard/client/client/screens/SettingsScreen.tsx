import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const [clearing, setClearing] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all transactions, payments, and workers. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data.');
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    danger = false,
  }: {
    icon: keyof typeof Feather.glyphMap;
    title: string;
    subtitle: string;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingItem,
        { backgroundColor: theme.backgroundDefault },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[
        styles.settingIcon,
        { backgroundColor: danger ? `${theme.error}20` : `${theme.primary}20` },
      ]}>
        <Feather name={icon} size={20} color={danger ? theme.error : theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText type="body" style={[styles.settingTitle, danger && { color: theme.error }]}>
          {title}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {subtitle}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={[styles.profileCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.avatar, { backgroundColor: `${theme.primary}20` }]}>
          <Feather name="hard-hat" size={32} color={theme.primary} />
        </View>
        <ThemedText type="h3">My Business</ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Construction Company
        </ThemedText>
      </View>

      <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
        PREFERENCES
      </ThemedText>

      <View style={styles.settingsGroup}>
        <SettingItem
          icon="globe"
          title="Currency"
          subtitle="Indian Rupee (INR)"
        />
        <SettingItem
          icon={isDark ? 'moon' : 'sun'}
          title="Appearance"
          subtitle={isDark ? 'Dark Mode' : 'Light Mode'}
        />
      </View>

      <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
        DATA
      </ThemedText>

      <View style={styles.settingsGroup}>
        <SettingItem
          icon="download"
          title="Export Data"
          subtitle="Download all transactions as CSV"
        />
        <SettingItem
          icon="upload-cloud"
          title="Backup & Sync"
          subtitle="Coming soon"
        />
        <SettingItem
          icon="trash-2"
          title="Clear All Data"
          subtitle="Delete all transactions and workers"
          onPress={handleClearData}
          danger
        />
      </View>

      <ThemedText type="small" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
        ABOUT
      </ThemedText>

      <View style={styles.settingsGroup}>
        <SettingItem
          icon="info"
          title="About BuildLedger"
          subtitle="Version 1.0.0"
        />
        <SettingItem
          icon="help-circle"
          title="Help & Support"
          subtitle="Get help with the app"
        />
      </View>

      <View style={styles.footer}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.footerIcon}
          resizeMode="contain"
        />
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          BuildLedger
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
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
  profileCard: {
    padding: Spacing['2xl'],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  settingsGroup: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    gap: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing['3xl'],
    paddingVertical: Spacing.xl,
  },
  footerIcon: {
    width: 48,
    height: 48,
    marginBottom: Spacing.sm,
    opacity: 0.6,
  },
});
