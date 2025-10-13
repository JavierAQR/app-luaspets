import CustomHeader from '@/components/CustomHeader';
import { API } from '@/constants/api';
import { useAuth } from '@/hooks/useAuth';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';


export default function EditProfileScreen() {
  const [user, setUser] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<any>(null);
  const router = useRouter();

  const fetchProfile = async () => {
    const token = await useAuth.getToken();
    const { data } = await API.get('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    const token = await useAuth.getToken();
    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('lastname', user.lastname);
    formData.append('phoneNumber', user.phoneNumber);
    formData.append('address', user.address);

    if (image) {
      formData.append('profileImage', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);
    }

    try {
      await API.put('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert('¡Éxito!', 'Perfil actualizado correctamente');
      router.back();
    } catch (err: any) {
      console.log('updateProfile error', err.response?.data || err.message);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c568f2" />
      </View>
    );
  }

  const currentImageUri = image?.uri || user.profileImage;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <CustomHeader />
      {/* Sección de imagen */}
      <View style={styles.imageSection}>
        <View style={styles.avatarContainer}>
          {currentImageUri ? (
            <Image source={{ uri: currentImageUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <MaterialIcons name="person" size={50} color="#fff" />
            </View>
          )}
          <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
            <MaterialIcons name="camera-alt" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.imageActionButton} onPress={pickImage}>
            <MaterialIcons name="photo-library" size={22} color="#c568f2" />
            <Text style={styles.imageActionText}>Galería</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.imageActionButton} onPress={takePhoto}>
            <MaterialIcons name="photo-camera" size={22} color="#c568f2" />
            <Text style={styles.imageActionText}>Cámara</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Formulario */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Información personal</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nombre</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="person-outline" size={22} color="#999" style={styles.inputIcon} />
            <TextInput
              placeholder="Ingresa tu nombre"
              placeholderTextColor="#999"
              value={user.name}
              onChangeText={(text) => setUser({ ...user, name: text })}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Apellido</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="person-outline" size={22} color="#999" style={styles.inputIcon} />
            <TextInput
              placeholder="Ingresa tu apellido"
              placeholderTextColor="#999"
              value={user.lastname}
              onChangeText={(text) => setUser({ ...user, lastname: text })}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Teléfono</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="phone" size={22} color="#999" style={styles.inputIcon} />
            <TextInput
              placeholder="Ingresa tu teléfono"
              placeholderTextColor="#999"
              value={user.phoneNumber}
              onChangeText={(text) => setUser({ ...user, phoneNumber: text })}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Dirección</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="location-on" size={22} color="#999" style={styles.inputIcon} />
            <TextInput
              placeholder="Ingresa tu dirección"
              placeholderTextColor="#999"
              value={user.address}
              onChangeText={(text) => setUser({ ...user, address: text })}
              style={styles.input}
              multiline
            />
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="check" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
          activeOpacity={0.8}
        >
          <MaterialIcons name="close" size={22} color="#666" />
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  imageSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#c568f2',
  },
  avatarPlaceholder: {
    backgroundColor: '#c568f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#c568f2',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  imageActionText: {
    color: '#c568f2',
    fontSize: 15,
    fontWeight: '600',
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#c568f2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
    gap: 10,
    shadowColor: '#c568f2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
    gap: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '700',
  },
});