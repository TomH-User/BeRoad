import React, { useState, useCallback } from 'react';
import { Text, View, Image, Button, ScrollView, StyleSheet, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { signOut } from '@/lib/appwrite';
import { router } from 'expo-router';

const Profile: React.FC = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [pseudo, setPseudo] = useState(user?.pseudo || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [motoPicture, setMotoPicture] = useState(user?.motoPicture || '');
  const [motoModel, setMotoModel] = useState(user?.motoModel || '');

  const [drivingType, setDrivingType] = useState<string[]>([]);
  const [preferredBikeType, setPreferredBikeType] = useState<string[]>([]);
  const [communityExperiences, setCommunityExperiences] = useState<string[]>([]);

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.push('/sign-in');
  };

  const handleDataChanged = useCallback(() => {
    setIsDataChanged(true);
  }, []);

  const handleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter(prev => {
      return prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value];
    });
    handleDataChanged();
  };

  const renderEditableImage = (uri: string, placeholder: string, onChange: (value: string) => void) => (
    <TextInput
      style={styles.textInput}
      onChangeText={onChange}
      value={uri}
      placeholder={`Lien ${placeholder}`}
    />
  );

  const renderImageSection = (uri: string, editable: boolean = true) => (
    <View style={styles.infoContainer}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.avatar}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}
      {editable && renderEditableImage(uri, 'de l\'image', setAvatar)}
    </View>
  );

  const renderCheckbox = (options: string[], selectedOptions: string[], onChange: (value: string) => void) => {
    return options.map(option => (
      <View key={option} style={styles.checkboxContainer}>
        <Text style={styles.checkboxText}>{option}</Text>
        <Switch
          value={selectedOptions.includes(option)}
          onValueChange={() => onChange(option)}
        />
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.wrapper}>
          <View style={styles.card}>
            <Text style={styles.titleText}>Informations de base</Text>
            {renderImageSection(avatar)}
            <TextInput
              style={styles.textInput}
              onChangeText={setPseudo}
              value={pseudo}
              placeholder="Pseudo"
            />
            <TextInput
              style={styles.textInput}
              onChangeText={setEmail}
              value={email}
              placeholder="Email"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.textInput}
              onChangeText={setPhone}
              value={phone}
              placeholder="Téléphone"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.titleText}>Détails de la moto</Text>
            {renderImageSection(motoPicture)}
            <TextInput
              style={styles.textInput}
              onChangeText={setMotoModel}
              value={motoModel}
              placeholder="Modèle de moto"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.titleText}>Type de conduite</Text>
            {renderCheckbox(
              ['Balades tranquilles', 'Road trips longue distance', 'Conduite sportive', 'Off-road / Tout-terrain', 'Moto urbaine'],
              drivingType,
              (value) => handleSelection(setDrivingType, value)
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.titleText}>Type de moto préférée</Text>
            {renderCheckbox(
              ['Roadster', 'Sportive', 'Custom / Cruiser', 'Trail / Adventure', 'Touring', 'Café racer / Vintage'],
              preferredBikeType,
              (value) => handleSelection(setPreferredBikeType, value)
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.titleText}>Expériences et communauté</Text>
            {renderCheckbox(
              ['Rencontrer d\'autres motards', 'Participer à des événements moto', 'Découvrir de nouveaux itinéraires', 'Voyager à l’étranger en moto', 'Conduite en groupe'],
              communityExperiences,
              (value) => handleSelection(setCommunityExperiences, value)
            )}
          </View>

          {user?.socialMedia && (
            <View style={styles.card}>
              <Text style={styles.titleText}>Réseaux sociaux</Text>
              <View>
                <Text style={styles.subtitleText}>{user.socialMedia}</Text>
              </View>
            </View>
          )}

          <View style={styles.logoutButton}>
            <Button
              title="Déconnexion"
              onPress={logout}
              color="#FF0000" // Update if needed to align with new styling
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#primary-color', // Ensure this matches the SignUp page
    padding: 16,
  },
  wrapper: {
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  titleText: {
    fontSize: 22,
    fontWeight: '600', // Adjust to match font-psemibold or similar
    color: '#gray-100', // Ensure matching text color
    marginBottom: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'lightgray',
  },
  subtitleText: {
    fontSize: 16,
    color: '#gray-100',
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 40,
    alignSelf: 'center',
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkboxText: {
    flex: 1,
    fontSize: 16,
    color: '#gray-100',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});

export default Profile;