import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";


export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#c568f2',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#c568f2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: 'Servicios',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="medical-services" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="productos"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="shopping-bag" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="mascotas"
        options={{
          title: 'Mascotas',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="pets" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="citas"
        options={{
          title: 'Citas',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="compras"
        options={{
          title: 'Compras',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt-long" size={size} color={color} />
          ),
        }}
      />
{/* 
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      /> */}
    </Tabs>
  );
}