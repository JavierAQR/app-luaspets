import { StyleSheet, Text, View } from 'react-native';

export default function MascotasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Mascotas</Text>
      <Text style={styles.subtitle}>
        Gestiona la información de tus mascotas
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
