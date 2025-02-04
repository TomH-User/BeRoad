import React from 'react';
import { Text, View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { signOut } from '@/lib/appwrite';
import { router } from 'expo-router';
import { icons } from "../../constants";

import CustomButton from '../../components/CustomButton';

const Profile: React.FC = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.push('/sign-in');
  };

  const navigateToEditProfile = () => {
    router.push('/edit_profil');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Profil</Text>
            <TouchableOpacity onPress={navigateToEditProfile} style={styles.iconWrapper}>
              <Image source={icons.edit} style={styles.icon} />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          {user?.avatar && <Image source={{ uri: user.avatar }} style={styles.avatar} />}
          
          {/* User Info Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Informations Utilisateur</Text>
            <View style={styles.infoRow}>
              <Text style={styles.cardText}>Nom d'utilisateur:</Text>
              <Text style={styles.userInfoText}>{user?.username || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.cardText}>Email:</Text>
              <Text style={styles.userInfoText}>{user?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.cardText}>Téléphone:</Text>
              <Text style={styles.userInfoText}>{user?.telephone || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.cardText}>Modèle de Moto:</Text>
              <Text style={styles.userInfoText}>{user?.motoModel || 'N/A'}</Text>
            </View>
          </View>

          {/* Moto Types */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Types de Moto Préférés</Text>
            <Text style={styles.cardText}>{user?.motoType?.join(', ') || 'N/A'}</Text>
          </View>

          {/* Driving Types */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Styles de Conduite</Text>
            <Text style={styles.cardText}>{user?.conduiteType?.join(', ') || 'N/A'}</Text>
          </View>

          {/* Community Experiences */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Expériences Communautaires</Text>
            <Text style={styles.cardText}>
              {user?.experiencesCommunity?.join(', ') || 'N/A'}
            </Text>
          </View>

          <CustomButton
            title="Déconnexion"
            handlePress={logout}
            containerStyles="mt-8"
            textStyles="text-white"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622', // Dark blue color
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFA500', // Orange color
    textAlign: 'center',
  },
  iconWrapper: {
    padding: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  card: {
    backgroundColor: '#222222', // Slightly lighter dark color
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA500', // Orange color
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 16,
    color: '#FFFFFF', // White color
  },
  userInfoText: {
    fontSize: 16,
    color: '#FFFFFF', // White color
    textAlign: 'right',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default Profile;