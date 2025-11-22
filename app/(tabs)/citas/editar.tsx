// app/(tabs)/citas/editar.tsx
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

type ServiceType = "GROOMING" | "CONSULTATION" | "VACCINE";
type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type Appointment = {
  id: string;
  date: string; // ISO
  status: AppointmentStatus;
  reason?: string | null;
  pet: {
    id: string;
    name: string;
    species: string;
  };
  service: {
    id: string;
    name: string;
    type: ServiceType;
    price: number;
    durationMin?: number | null;
  };
};

export default function EditarCitaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const appointmentId = id as string | undefined;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) {
        Alert.alert("Error", "No se encontró el identificador de la cita.");
        router.back();
        return;
      }

      try {
        setLoading(true);
        const token = await useAuth.getToken();
        if (!token) {
          await useAuth.clearSession();
          router.replace("/(auth)" as never);
          return;
        }

        const res = await API.get<Appointment>(`/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const appt = res.data;

        // Solo permitir modificar si está pendiente o confirmada
        if (appt.status === "COMPLETED" || appt.status === "CANCELLED") {
          Alert.alert(
            "No editable",
            "Solo puedes modificar citas pendientes o confirmadas."
          );
          router.replace("/(tabs)/citas" as never);
          return;
        }

        setAppointment(appt);

        const d = new Date(appt.date);
        if (!Number.isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          const hh = String(d.getHours()).padStart(2, "0");
          const min = String(d.getMinutes()).padStart(2, "0");

          setDateStr(`${yyyy}-${mm}-${dd}`);
          setTimeStr(`${hh}:${min}`);
        }

        setReason(appt.reason || "");
      } catch (err: any) {
        console.log("getAppointmentById (edit) error:", err?.response?.data || err.message);
        Alert.alert(
          "Error",
          err?.response?.data?.message || "No se pudo cargar la cita."
        );
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, router]);

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
    if (!appointment) return false;

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

  const handleSave = async () => {
    if (!appointment) return;
    if (!validateForm()) return;

    Alert.alert(
      "Confirmar cambios",
      "Se cancelará la cita actual y se creará una nueva con la nueva fecha y hora.",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Continuar",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              const token = await useAuth.getToken();
              if (!token) {
                await useAuth.clearSession();
                router.replace("/(auth)" as never);
                return;
              }

              const isoString = `${dateStr}T${timeStr}:00`;

              // 1) Cancelar cita actual
              await API.delete(`/appointments/${appointment.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              // 2) Crear nueva cita con mismo petId y serviceId
              await API.post(
                "/appointments",
                {
                  petId: appointment.pet.id,
                  serviceId: appointment.service.id,
                  date: isoString,
                  reason: reason || undefined,
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              Alert.alert(
                "Cita reprogramada",
                "La cita fue modificada correctamente.",
                [
                  {
                    text: "Ver mis citas",
                    onPress: () => router.replace("/(tabs)/citas" as never),
                  },
                ]
              );
            } catch (err: any) {
              console.log(
                "editAppointment error:",
                err?.response?.data || err.message
              );
              Alert.alert(
                "Error",
                err?.response?.data?.message ||
                  "No se pudo modificar la cita. Intenta nuevamente."
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading || !appointment) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#c568f2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View className="header" style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modificar cita</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumen mascota y servicio */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Resumen</Text>

          <View style={styles.row}>
            <MaterialIcons name="pets" size={20} color="#c568f2" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.value}>{appointment.pet.name}</Text>
              <Text style={styles.subValue}>{appointment.pet.species}</Text>
            </View>
          </View>

          <View style={[styles.row, { marginTop: 12 }]}>
            <MaterialIcons name="medical-services" size={20} color="#c568f2" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.value}>{appointment.service.name}</Text>
              <Text style={styles.subValue}>
                {mapServiceTypeLabel(appointment.service.type)}
                {appointment.service.durationMin
                  ? ` · ${appointment.service.durationMin} min`
                  : ""}
              </Text>
            </View>
            <Text style={styles.price}>
              s/ {Number(appointment.service.price).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Fecha y hora */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Nueva fecha y hora</Text>

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
            La nueva fecha y hora deben ser futuras.
          </Text>
        </View>

        {/* Motivo */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Motivo (opcional)</Text>
          <TextInput
            style={[styles.input, { height: 90, textAlignVertical: "top" }]}
            placeholder="Actualiza el motivo si es necesario"
            placeholderTextColor="#aaa"
            multiline
            value={reason}
            onChangeText={setReason}
          />
        </View>
      </ScrollView>

      {/* Guardar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.9}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
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
    paddingHorizontal: 16,
    paddingTop: 20,
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
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  subValue: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#c568f2",
  },
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
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  saveButton: {
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
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
