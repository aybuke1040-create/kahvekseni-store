import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { useCartStore } from '../../store/cartStore';
import { View, Text } from 'react-native';

function CartIcon({ focused }: { focused: boolean }) {
  const itemCount = useCartStore((s) => s.itemCount());
  return (
    <View>
      <Ionicons name={focused ? 'cart' : 'cart-outline'} size={24} color={focused ? Colors.gold : Colors.gray} />
      {itemCount > 0 && (
        <View style={{
          position: 'absolute', right: -6, top: -4,
          backgroundColor: Colors.gold, borderRadius: 10,
          width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{itemCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: {
          backgroundColor: Colors.brown,
          borderTopColor: Colors.brownLight,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11 },
        headerStyle: { backgroundColor: Colors.brown },
        headerTintColor: Colors.cream,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Anasayfa',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={focused ? Colors.gold : Colors.gray} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Ürünler',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'cafe' : 'cafe-outline'} size={24} color={focused ? Colors.gold : Colors.gray} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Sepet',
          tabBarIcon: ({ focused }) => <CartIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="loyalty"
        options={{
          title: 'Puanlarım',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'star' : 'star-outline'} size={24} color={focused ? Colors.gold : Colors.gray} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Hesabım',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={focused ? Colors.gold : Colors.gray} />
          ),
        }}
      />
    </Tabs>
  );
}
