import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MoreScreen from '@/screens/MoreScreen';
import PluginsScreen from '@/screens/PluginsScreen';
import ReportsScreen from '@/screens/ReportsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { useScreenOptions } from '@/hooks/useScreenOptions';

export type MoreStackParamList = {
  More: undefined;
  Plugins: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="More"
        component={MoreScreen}
        options={{
          headerTitle: 'More',
        }}
      />
      <Stack.Screen
        name="Plugins"
        component={PluginsScreen}
        options={{
          headerTitle: 'Extensions',
        }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          headerTitle: 'Reports',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
}
