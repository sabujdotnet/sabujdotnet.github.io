import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LaborScreen from '@/screens/LaborScreen';
import { useScreenOptions } from '@/hooks/useScreenOptions';

export type LaborStackParamList = {
  Labor: undefined;
};

const Stack = createNativeStackNavigator<LaborStackParamList>();

export default function LaborStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Labor"
        component={LaborScreen}
        options={{
          headerTitle: 'Weekly Payroll',
        }}
      />
    </Stack.Navigator>
  );
}
