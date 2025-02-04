import React, { useEffect, useState } from 'react';
import * as Contacts from 'expo-contacts';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ContactRow from '../../components/ContactRow';
import { findRegisteredContacts } from '../../lib/appwrite';
import { useNavigation } from '@react-navigation/native';
import { Link, router } from 'expo-router';
import StyledButton from '../../components/StyledButton';
import { icons } from "../../constants";

const Crew = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const getPermission = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        // Uncomment to search contacts automatically
        // searchContacts();
      }
    };
    getPermission();
  }, []);

  const searchContacts = async () => {
    setIsLoading(true);

    const config = { sort: Contacts.SortTypes.FirstName };
    if (search !== '') {
      config.name = search;
    }

    const loadedContacts = (await Contacts.getContactsAsync(config)) || { data: [] };

    if (loadedContacts.data.length === 0) {
      setContacts([]);
      setIsLoading(false);
      return;
    }

    // Filter registered contacts
    const registeredContacts = await findRegisteredContacts(loadedContacts.data);
    setContacts(registeredContacts);
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>

        {/* Welcome Section */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Bienvenue dans votre Crew !</Text>
          <View style={styles.iconWrapper}>
            {/* Add an icon here if needed */}
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <TextInput
            placeholder="Rechercher un contact"
            onChangeText={setSearch}
            value={search}
            style={styles.textInput}
            placeholderTextColor="#FFFFFF"
          />
          <TouchableOpacity onPress={searchContacts} style={styles.iconWrapper}>
            <Image source={icons.search} style={styles.icon} />
          </TouchableOpacity>
        </View>

        {/* Contacts List Section */}
        {isLoading ? (
          <Text style={styles.cardText}>Loading...</Text>
        ) : (
          <FlatList
            style={styles.list}
            data={contacts}
            keyExtractor={(contact) => contact.id}
            ListEmptyComponent={() => <Text style={styles.cardText}>Pas encore de contact ? Faites une recherche !</Text>}
            renderItem={({ item }) => <ContactRow contact={item} />}
          />
        )}

        <StatusBar backgroundColor='#161622' style='light' />

        {/* Floating Friend Requests Button */}
        <View style={styles.floatingButtonContainer}>
          <StyledButton title="Voir mes demandes d'amis" onPress={() => router.push('/friend-requests')} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622',
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 80, // to ensure the button doesn't overlap content
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFA500',
    textAlign: 'center',
    marginTop: 25,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  cardText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  section: {
    marginVertical: 10,
    width: '100%',
    flexDirection: 'row',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  textInput: {
    padding: 5,
    borderColor: '#FFA500',
    borderWidth: 1,
    flex: 1,
    color: '#FFFFFF',
    marginRight: 8,
  },
  list: {
    flex: 1,
    marginTop: 10,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  }
});

export default Crew;