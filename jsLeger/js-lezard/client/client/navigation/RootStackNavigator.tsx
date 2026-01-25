import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from '@/navigation/MainTabNavigator';
import AddTransactionScreen from '@/screens/AddTransactionScreen';
import TransactionDetailScreen from '@/screens/TransactionDetailScreen';
import AddPaymentScreen from '@/screens/AddPaymentScreen';
import PaymentDetailScreen from '@/screens/PaymentDetailScreen';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Transaction, LaborPayment } from '@/types';

export type RootStackParamList = {
  Main: undefined;
  AddTransaction: undefined;
  TransactionDetail: { transaction: Transaction };
  AddPayment: { weekStart: string };
  PaymentDetail: { payment: LaborPayment };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{
          presentation: 'modal',
          headerTitle: 'New Entry',
        }}
      />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{
          headerTitle: 'Transaction',
        }}
      />
      <Stack.Screen
        name="AddPayment"
        component={AddPaymentScreen}
        options={{
          presentation: 'modal',
          headerTitle: 'Log Payment',
        }}
      />
      <Stack.Screen
        name="PaymentDetail"
        component={PaymentDetailScreen}
        options={{
          headerTitle: 'Payment Details',
        }}
      />
    </Stack.Navigator>
  );
}
