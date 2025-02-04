import React from 'react'
import * as Contacts from "expo-contacts";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {Button, FlatList, SafeAreaView, StyleSheet, Text, TextInput, View} from "react-native";
import ContactRow from "../../components/ContactRow";
import { findRegisteredContacts } from "../../lib/appwrite";
import { useNavigation } from "@react-navigation/native";
import { Link, router } from 'expo-router'
import StyledButton from '../../components/StyledButton'

const Crew = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState();
  const navigation = useNavigation();

  useEffect(() => {
    const getPermission = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        //searchContacts();
      }
    };
    getPermission();
  }, []);

const searchContacts = async () => {
    setIsLoading(true);

    const config = { sort: Contacts.SortTypes.FirstName };
    if (search !== "") {
        config.name = search;
    }

    const loadedContacts = (await Contacts.getContactsAsync(config)) || { data: [] };

    if (loadedContacts.data.length === 0) {
        setContacts([]);
        setIsLoading(false);
        return;
    }

    // Filtrer les contacts enregistrés
    const registeredContacts = await findRegisteredContacts(loadedContacts.data);

    setContacts(registeredContacts);
    setIsLoading(false);
};

return (
  <SafeAreaView style={styles.container}>
    {/* Section Bienvenue */}
    <View style={styles.welcomeSection}>
      <Text style={styles.welcomeText}>Bienvenue dans votre Crew !</Text>
    </View>

    {/* Section Demandes d'amis */}
    <View style={styles.section}>
      <StyledButton title="Voir mes demandes d'amis" onPress={() => router.push("/friend-requests")} />
    </View>

    {/* Section Recherche */}
    <View style={styles.searchSection}>
      <TextInput
        placeholder="Rechercher un contact"
        onChangeText={setSearch}
        value={search}
        style={styles.textInput}
      />
      <StyledButton title="Rechercher" onPress={searchContacts} />
    </View>

    {/* Section Liste des contacts */}
    {isLoading ? (
      <Text style={styles.list}>Loading...</Text>
    ) : (
      <FlatList
        style={styles.list}
        data={contacts}
        keyExtractor={(contact) => contact.id}
        ListEmptyComponent={() => <Text>Pas encore de contact ? Faites une recherche !</Text>}
        renderItem={({ item }) => (
          <ContactRow contact={item} />
        )}
      />
    )}

    <StatusBar backgroundColor='#161622' style='light' />
  </SafeAreaView>
);

}

const styles = StyleSheet.create({
  container: {
    marginTop: 35,
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  welcomeSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#161622",
  },
  section: {
    marginVertical: 10,
    marginBottom: 30,
    width: "100%",
    flexDirection: "row"
    // alignItems: "center",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    justifyContent: "space-between",
    width: "120%",
  },
  textInput: {
    padding: 5,
    marginRight: 8,
    borderColor: "black",
    borderWidth: 1,
    flex: 1,
  },
  list: {
    flex: 1,
    marginTop: 10,
  },
});

export default Crew