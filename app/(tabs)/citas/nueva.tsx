// app/(tabs)/citas/nueva.tsx
import { API } from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Pet = {
  id: string;
  name: string;
  species: string;
};

type ServiceType = "GROOMING" | "CONSULTATION" | "VACCINE";

type Service = {
  id: string;
  name: string;
  type: ServiceType;
  price: number;
  durationMin?: number | null;
};

export default function NuevaCitaScreen() {
    const router = useRouter();
  
    const [pets, setPets] = useState<Pet[]>([]);
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
  
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
      null
    );
    const [dateStr, setDateStr] = useState(""); // YYYY-MM-DD
    const [timeStr, setTimeStr] = useState(""); // HH:mm
    const [reason, setReason] = useState("");
  
    const params = useLocalSearchParams();
    const preselectedServiceId = params.serviceId as string | undefined;
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          if (!preselectedServiceId) {
            Alert.alert(
              "Error",
              "No se ha especificado un servicio para la cita."
            );
            router.back();
            return;
          }
  
          setLoading(true);
          const token = await useAuth.getToken();
          if (!token) {
            await useAuth.clearSession();
            router.replace("/(auth)" as never);
            return;
          }
  
          // Mascotas del usuario
          const petsRes = await API.get<Pet[]>("/pets", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          // Servicio seleccionado (solo uno)
          const serviceRes = await API.get<Service>(
            `/services/${preselectedServiceId}`
          );
  
          setPets(petsRes.data);
          setService(serviceRes.data);
          setSelectedServiceId(serviceRes.data.id);
  
          // Preseleccionar primera mascota si existe
          if (petsRes.data.length > 0) {
            setSelectedPetId(petsRes.data[0].id);
          }
        } catch (err: any) {
          console.log(
            "fetch pets/service error:",
            err?.response?.data || err.message
          );
          Alert.alert(
            "Error",
            err?.response?.data?.message ||
              "No se pudieron cargar los datos para agendar la cita."
          );
          router.back();
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [preselectedServiceId, router]);
  
    const mapServiceTypeLabel = (t: ServiceType) => {
      switch (t) {
        case "GROOMING":
          return "Grooming";
        case "CONSULTATION":
          return "Consulta";
        case "VACCINE":
          return "Vacuna";
        default:
          return t;
      }
    };
  
    const validateForm = () => {
      if (!selectedPetId) {
        Alert.alert("Validación", "Selecciona una mascota.");
        return false;
      }
      if (!selectedServiceId) {
        Alert.alert("Validación", "No se ha podido obtener el servicio.");
        return false;
      }
      if (!dateStr.trim()) {
        Alert.alert("Validación", "Ingresa la fecha de la cita (YYYY-MM-DD).");
        return false;
      }
      if (!timeStr.trim()) {
        Alert.alert("Validación", "Ingresa la hora de la cita (HH:mm).");
        return false;
      }
  
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        Alert.alert("Validación", "La fecha debe tener el formato YYYY-MM-DD.");
        return false;
      }
      if (!/^\d{2}:\d{2}$/.test(timeStr)) {
        Alert.alert("Validación", "La hora debe tener el formato HH:mm (24h).");
        return false;
      }
  
      return true;
    };
  
    const handleSubmit = async () => {
      if (!validateForm()) return;
  
      try {
        setSubmitting(true);
        const token = await useAuth.getToken();
        if (!token) {
          await useAuth.clearSession();
          router.replace("/(auth)" as never);
          return;
        }
  
        const isoString = `${dateStr}T${timeStr}:00`;
  
        await API.post(
          "/appointments",
          {
            petId: selectedPetId,
            serviceId: selectedServiceId,
            date: isoString,
            reason: reason || undefined,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        Alert.alert("Cita agendada", "Tu cita fue registrada correctamente.", [
          {
            text: "Ver mis citas",
            onPress: () => router.back(),
          },
        ]);
      } catch (err: any) {
        console.log(
          "createAppointment error:",
          err?.response?.data || err.message
        );
        Alert.alert(
          "Error",
          err?.response?.data?.message ||
            "No se pudo agendar la cita. Verifica los datos e intenta nuevamente."
        );
      } finally {
        setSubmitting(false);
      }
    };
  
    if (loading) {
      return (
        <View style={[styles.container, { justifyContent: "center" }]}>
          <ActivityIndicator size="large" color="#c568f2" />
        </View>
      );
    }
  
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/citas")}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agendar nueva cita</Text>
        </View>
  
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Selección de mascota */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Selecciona tu mascota</Text>
  
            {pets.length === 0 ? (
              <View style={styles.emptyPetsBox}>
                <MaterialIcons name="pets" size={40} color="#ccc" />
                <Text style={styles.emptyPetsText}>
                  No tienes mascotas registradas.
                </Text>
                <Text style={styles.emptyPetsSubText}>
                  Primero agrega una mascota para poder agendar una cita.
                </Text>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => router.push("/(tabs)/mascotas" as never)}
                >
                  <Text style={styles.linkButtonText}>Ir a mis mascotas</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 8 }}
              >
                {pets.map((pet) => {
                  const selected = pet.id === selectedPetId;
                  return (
                    <TouchableOpacity
                      key={pet.id}
                      style={[styles.petChip, selected && styles.petChipSelected]}
                      onPress={() => setSelectedPetId(pet.id)}
                    >
                      <MaterialIcons
                        name="pets"
                        size={18}
                        color={selected ? "#fff" : "#c568f2"}
                      />
                      <View>
                        <Text
                          style={[
                            styles.petChipName,
                            selected && { color: "#fff" },
                          ]}
                        >
                          {pet.name}
                        </Text>
                        <Text
                          style={[
                            styles.petChipSpecies,
                            selected && { color: "#f4e4ff" },
                          ]}
                        >
                          {pet.species}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
  
          {/* Servicio seleccionado (solo lectura) */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Servicio seleccionado</Text>
  
            {!service ? (
              <Text style={{ color: "#999", marginTop: 8 }}>
                No se pudo cargar la información del servicio.
              </Text>
            ) : (
              <View style={[styles.serviceRow, styles.serviceRowSelected]}>
                <View style={styles.serviceIcon}>
                  <MaterialIcons
                    name="medical-services"
                    size={20}
                    color="#fff"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.serviceName, { color: "#fff" }]}>
                    {service.name}
                  </Text>
                  <Text style={[styles.serviceTypeText, { color: "#f4e4ff" }]}>
                    {mapServiceTypeLabel(service.type)}
                    {service.durationMin
                      ? ` · ${service.durationMin} min`
                      : ""}
                  </Text>
                </View>
                <Text style={[styles.servicePrice, { color: "#fff" }]}>
                  s/ {Number(service.price).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
  
          {/* Fecha y hora */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Fecha y hora</Text>
  
            <Text style={styles.label}>Fecha (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 2024-12-05"
              placeholderTextColor="#aaa"
              value={dateStr}
              onChangeText={setDateStr}
            />
  
            <Text style={styles.label}>Hora (HH:mm)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 10:30"
              placeholderTextColor="#aaa"
              value={timeStr}
              onChangeText={setTimeStr}
            />
  
            <Text style={styles.helperText}>
              La fecha y hora deben ser futuras. El sistema no permite citas en el
              pasado.
            </Text>
          </View>
  
          {/* Motivo */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Motivo de la cita</Text>
            <TextInput
              style={[styles.input, { height: 90, textAlignVertical: "top" }]}
              placeholder="Describe brevemente el motivo de la cita (opcional)"
              placeholderTextColor="#aaa"
              multiline
              value={reason}
              onChangeText={setReason}
            />
          </View>
        </ScrollView>
  
        {/* Botón agendar */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.9}
            onPress={handleSubmit}
            disabled={submitting || pets.length === 0 || !service}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="event-available" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Confirmar cita</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },

  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },

  // Mascotas
  emptyPetsBox: {
    alignItems: "center",
    paddingVertical: 10,
  },
  emptyPetsText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#666",
    marginTop: 8,
  },
  emptyPetsSubText: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
  linkButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#c568f2",
  },
  linkButtonText: {
    color: "#c568f2",
    fontWeight: "600",
    fontSize: 13,
  },
  petChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#f8f8f8",
    marginRight: 10,
    gap: 8,
  },
  petChipSelected: {
    backgroundColor: "#c568f2",
  },
  petChipName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  petChipSpecies: {
    fontSize: 12,
    color: "#777",
  },

  // Servicios
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "#f8f8f8",
    marginBottom: 8,
    gap: 10,
  },
  serviceRowSelected: {
    backgroundColor: "#c568f2",
  },
  serviceIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1e6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  serviceTypeText: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#c568f2",
  },

  // Fecha/hora
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 14,
    color: "#333",
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: "#999",
  },

  // Footer
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  submitButton: {
    backgroundColor: "#c568f2",
    borderRadius: 30,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#c568f2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
