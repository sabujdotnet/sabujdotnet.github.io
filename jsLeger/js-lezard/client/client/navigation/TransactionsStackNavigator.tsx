import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TransactionsScreen from '@/screens/TransactionsScreen';
import { useScreenOptions } from '@/hooks/useScreenOptions';

export type TransactionsStackParamList = {
  Transactions: undefined;
};

const Stack = createNativeStackNavigator<TransactionsStackParamList>();

export default function TransactionsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          headerTitle: 'Transactions',
        }}
      />
    </Stack.Navigator>
  );
}
