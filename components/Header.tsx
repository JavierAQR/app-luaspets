import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  showProfile?: boolean;
  showCart?: boolean;
  onProfilePress?: () => void;
  onCartPress?: () => void;
}

export default function Header({
  showProfile = true,
  showCart = true,
  onProfilePress,
  onCartPress,
}: HeaderProps) {
  const router = useRouter();

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/(tabs)');
    }
  };

  const handleCartPress = () => {
    if (onCartPress) {
      onCartPress();
    } else {
      router.push('/(tabs)');
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={handleProfilePress}
      >
        {showProfile && <MaterialIcons name="person" size={28} color="#333" />}
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
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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