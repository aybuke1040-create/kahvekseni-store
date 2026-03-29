import { Stack } from 'expo-router';
import { Colors } from '../constants';

export default function RootLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: Colors.brown },
      headerTintColor: Colors.cream,
      headerTitleStyle: { fontWeight: 'bold' },
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Ürün Detayı' }} />
      <Stack.Screen name="checkout" options={{ title: 'Ödeme' }} />
      <Stack.Screen name="b2b" options={{ title: 'Toptan Satış' }} />
    </Stack>
  );
}
