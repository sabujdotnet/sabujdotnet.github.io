import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { PluginCard } from '@/components/PluginCard';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/theme';
import { Plugin } from '@/types';
import { getPlugins, savePlugin } from '@/lib/storage';

export default function PluginsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const data = await getPlugins();
    setPlugins(data);
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

  const handleInstall = async (plugin: Plugin) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updated = { ...plugin, isInstalled: true, isEnabled: true };
    await savePlugin(updated);
    await loadData();
  };

  const handleUninstall = async (plugin: Plugin) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = { ...plugin, isInstalled: false, isEnabled: false };
    await savePlugin(updated);
    await loadData();
  };

  const installedPlugins = plugins.filter(p => p.isInstalled);
  const availablePlugins = plugins.filter(p => !p.isInstalled);

  const renderItem = ({ item }: { item: Plugin }) => (
    <PluginCard
      plugin={item}
      onInstall={() => handleInstall(item)}
      onUninstall={() => handleUninstall(item)}
    />
  );

  const ListHeader = () => (
    <View style={styles.header}>
      {installedPlugins.length > 0 ? (
        <>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Installed ({installedPlugins.length})
          </ThemedText>
          {installedPlugins.map(plugin => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              onUninstall={() => handleUninstall(plugin)}
            />
          ))}
        </>
      ) : null}
      <ThemedText type="h4" style={[styles.sectionTitle, { marginTop: installedPlugins.length > 0 ? Spacing.xl : 0 }]}>
        Available Plugins
      </ThemedText>
    </View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={availablePlugins}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        installedPlugins.length === 0 ? (
          <EmptyState
            image={require('../../assets/images/empty-plugins.png')}
            title="No plugins available"
            description="Check back later for new extensions"
          />
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
});
