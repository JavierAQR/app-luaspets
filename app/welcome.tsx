import { useRouter } from "expo-router";
import React from "react";
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../assets/bg-patas.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        {/* Sección superior: logo */}
        <View style={styles.topSection}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Sección inferior: botones */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/(auth)" as const
              })
            }
          >
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  topSection: {
    marginTop: 100,
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 250,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#BC55D5",
    paddingVertical: 16,
    paddingHorizontal: 120,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  registerText: {
    color: "white",
    fontSize: 14,
  },
  registerLink: {
    color: "#D26FEA",
    fontWeight: "bold",
  },
});
