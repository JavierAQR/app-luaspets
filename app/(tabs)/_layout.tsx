import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function CustomHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
    <View style={styles.header}>
    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => router.push('/(tabs)')}
    >
      <MaterialIcons name="person" size={28} color="#333" />
    </TouchableOpacity>

    <Image
      source={require('../../assets/logo.png')}
      style={styles.logo}
      resizeMode="contain"
    />

    <TouchableOpacity
      style={styles.headerButton}
      onPress={() => router.push('/(tabs)')}
    >
      <MaterialIcons name="shopping-cart" size={28} color="#333" />
    </TouchableOpacity>
    </View>
  </View>
  );
}


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


const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 60,
  },
});