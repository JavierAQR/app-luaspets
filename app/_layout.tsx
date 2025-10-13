import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 👇 Esta será la primera pantalla que se ejecuta */}
        <Stack.Screen name="index" />

        {/* 👇 Pantalla de bienvenida */}
        <Stack.Screen name="welcome" />

        {/* 👇 Grupo de autenticación */}
        <Stack.Screen name="(auth)" />

        {/* 👇 Grupo de tabs */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
