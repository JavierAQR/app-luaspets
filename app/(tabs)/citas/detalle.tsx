// app/(tabs)/citas/detalle.tsx
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
  notes?: string | null;
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

export default function DetalleCitaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const appointmentId = id as string | undefined;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

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

        setAppointment(res.data);
      } catch (err: any) {
        console.log("getAppointmentById error:", err?.response?.data || err.message);
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

  const getStatusConfig = (status: AppointmentStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pendiente",
          color: "#3498db",
          bg: "#e8f4fd",
          icon: "schedule",
        };
      case "CONFIRMED":
        return {
          label: "Confirmada",
          color: "#27ae60",
          bg: "#e8f8f0",
          icon: "check-circle",
        };
      case "CANCELLED":
        return {
          label: "Cancelada",
          color: "#e74c3c",
          bg: "#fdeaea",
          icon: "cancel",
        };
      case "COMPLETED":
        return {
          label: "Completada",
          color: "#8e44ad",
          bg: "#f5e8ff",
          icon: "done-all",
        };
      default:
        return {
          label: status,
          color: "#999",
          bg: "#f5f5f5",
          icon: "help",
        };
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: "-", time: "-" };

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`,
    };
  };

  const handleCancelAppointment = () => {
    if (!appointment) return;

    if (appointment.status === "COMPLETED") {
      Alert.alert("No se puede cancelar", "La cita ya fue completada.");
      return;
    }
    if (appointment.status === "CANCELLED") {
      Alert.alert("Ya cancelada", "La cita ya está cancelada.");
      return;
    }

    Alert.alert(
      "Cancelar cita",
      "¿Estás seguro de que quieres cancelar esta cita?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setCanceling(true);
              const token = await useAuth.getToken();
              if (!token) {
                await useAuth.clearSession();
                router.replace("/(auth)" as never);
                return;
              }

              await API.delete(`/appointments/${appointment.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setAppointment((prev) =>
                prev ? { ...prev, status: "CANCELLED" } : prev
              );

              Alert.alert("Cita cancelada", "La cita fue cancelada correctamente.");
            } catch (err: any) {
              console.log(
                "cancelAppointment error:",
                err?.response?.data || err.message
              );
              Alert.alert(
                "Error",
                err?.response?.data?.message ||
                  "No se pudo cancelar la cita. Intenta nuevamente."
              );
            } finally {
              setCanceling(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!appointment) return;
    router.push({
      pathname: "/(tabs)/citas/editar",
      params: { id: appointment.id },
    } as any);
  };

  if (loading || !appointment) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#c568f2" />
      </View>
    );
  }

  const statusCfg = getStatusConfig(appointment.status);
  const { date, time } = formatDateTime(appointment.date);

  const isEditable =
    appointment.status === "PENDING" || appointment.status === "CONFIRMED";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de cita</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Estado */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}
            >
              <MaterialIcons
                name={statusCfg.icon as any}
                size={18}
                color={statusCfg.color}
              />
              <Text
                style={[styles.statusText, { color: statusCfg.color }]}
              >
                {statusCfg.label}
              </Text>
            </View>
            <Text style={styles.appointmentId}>ID: {appointment.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={20} color="#666" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.value}>{date}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={20} color="#666" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.label}>Hora</Text>
              <Text style={styles.value}>{time} hrs</Text>
            </View>
          </View>
        </View>

        {/* Mascota */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mascota</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="pets" size={22} color="#c568f2" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.value}>{appointment.pet.name}</Text>
              <Text style={styles.subValue}>{appointment.pet.species}</Text>
            </View>
          </View>
        </View>

        {/* Servicio */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Servicio</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="medical-services" size={22} color="#c568f2" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.value}>{appointment.service.name}</Text>
              <Text style={styles.subValue}>
                {appointment.service.type === "GROOMING"
                  ? "Grooming"
                  : appointment.service.type === "CONSULTATION"
                  ? "Consulta"
                  : "Vacuna"}
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

        {/* Motivo y notas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalles</Text>

          <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>Motivo</Text>
            <Text style={styles.value}>
              {appointment.reason || "Sin motivo especificado"}
            </Text>
          </View>

          {appointment.notes && (
            <View>
              <Text style={styles.label}>Notas del veterinario</Text>
              <Text style={styles.value}>{appointment.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Acciones */}
      <View style={styles.footer}>
        {isEditable && (
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
          >
            <MaterialIcons name="edit-calendar" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Modificar cita</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.cancelButton,
            !isEditable && { opacity: 0.7 },
          ]}
          onPress={handleCancelAppointment}
          disabled={canceling || !isEditable}
        >
          {canceling ? (
            <ActivityIndicator color="#e74c3c" />
          ) : (
            <>
              <MaterialIcons name="close" size={20} color="#e74c3c" />
              <Text style={styles.cancelButtonText}>Cancelar cita</Text>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  card: {
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
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  appointmentId: {
    fontSize: 11,
    color: "#999",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 2,
  },
  subValue: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#c568f2",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  editButton: {
    backgroundColor: "#c568f2",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fdeaea",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelButtonText: {
    color: "#e74c3c",
    fontSize: 14,
    fontWeight: "700",
  },
});
