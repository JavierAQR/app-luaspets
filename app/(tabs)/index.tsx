import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";
import { useAuth } from "../../hooks/useAuth";

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await useAuth.clearToken();
    router.replace("/(auth)/login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Bienvenido 👋</Text>
      <Button mode="contained" onPress={handleLogout}>
        Cerrar sesión
      </Button>
    </View>
  );
}