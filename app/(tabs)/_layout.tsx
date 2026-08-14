import CustomHeader from "@/components/CustomHeader";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <CustomHeader />,
        tabBarActiveTintColor: '#c568f2',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
          paddingTop: 5,
          height: (insets.bottom > 0 ? insets.bottom : 0) + 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Servicios",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="medical-services" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="productos"
        options={{
          title: "Productos",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="shopping-bag" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="mascotas"
        options={{
          title: "Mascotas",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="pets" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="citas"
        options={{
          title: "Citas",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="compras"
        options={{
          title: "Compras",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt-long" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}