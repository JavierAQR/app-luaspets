import { MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomHeaderProps {
  showProfile?: boolean;
  showCart?: boolean;
  onProfilePress?: () => void;
  onCartPress?: () => void;
}

export default function CustomHeader({
  showProfile = true,
  showCart = true,
  onProfilePress,
  onCartPress,
}: CustomHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isProfileRoute = pathname.startsWith('/profile');

  const handleLeftButtonPress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else if (isProfileRoute) {
      // Si estamos en perfil, volver a tabs
      router.push('/(tabs)');
    } else {
      // Si no, ir a perfil
      router.push('/profile');
    }
  };

  const handleCartPress = () => {
    if (onCartPress) {
      onCartPress();
    } else {
      router.push('/cart');
    }
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.header}>
      <TouchableOpacity
          style={styles.headerButton}
          onPress={handleLeftButtonPress}
        >
          {showProfile && (
            <MaterialIcons 
              name={isProfileRoute ? "arrow-back" : "person"} 
              size={28} 
              color="#333" 
            />
          )}
        </TouchableOpacity>

        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCartPress}
        >
          {showCart && <MaterialIcons name="shopping-cart" size={28} color="#333" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 60,
  },
});