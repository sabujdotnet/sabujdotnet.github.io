import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Plugin } from '@/types';

interface PluginCardProps {
  plugin: Plugin;
  onInstall?: () => void;
  onUninstall?: () => void;
  onToggle?: (enabled: boolean) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PluginCard({ plugin, onInstall, onUninstall, onToggle }: PluginCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (plugin.isInstalled) {
      onUninstall?.();
    } else {
      onInstall?.();
    }
  };

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}20` }]}>
        <Feather
          name={plugin.icon as keyof typeof Feather.glyphMap}
          size={24}
          color={theme.primary}
        />
      </View>
      <View style={styles.content}>
        <ThemedText type="body" style={styles.name}>
          {plugin.name}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={2}>
          {plugin.description}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          v{plugin.version} • {plugin.author}
        </ThemedText>
      </View>
      <Pressable
        onPress={handleAction}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[
          styles.actionButton,
          {
            backgroundColor: plugin.isInstalled ? theme.backgroundSecondary : theme.primary,
          },
        ]}
        testID={`plugin-action-${plugin.id}`}
      >
        <ThemedText
          type="small"
          style={{
            color: plugin.isInstalled ? theme.text : '#FFFFFF',
            fontWeight: '600',
          }}
        >
          {plugin.isInstalled ? 'Remove' : 'Install'}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  actionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginLeft: Spacing.sm,
  },
});
