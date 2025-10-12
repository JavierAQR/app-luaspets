import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 👇 Esta será la primera pantalla al abrir la app */}
      <Stack.Screen name="welcome" />

      {/* 👇 Esto mantiene tu grupo de autenticación */}
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}