import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await useAuth.getToken();
        
        if (token) {
          router.replace("/(tabs)");
        } else {
          router.replace("/welcome");
        }
      } catch (err) {
        console.error("Error verificando token:", err);
        router.replace("/welcome");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#c568f2" />
      </View>
    );
  }

  return null;
}