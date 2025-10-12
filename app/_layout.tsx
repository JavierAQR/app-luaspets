import { Stack } from "expo-router";


export default function RootLayout() {
  return (
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
  );
}