import React from 'react'
import * as Contacts from "expo-contacts";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {Button, FlatList, SafeAreaView, StyleSheet, Text, TextInput, View} from "react-native";
import ContactRow from "../../components/ContactRow";
import { findRegisteredContacts } from "../../lib/appwrite";
import { useNavigation } from "@react-navigation/native";
import { Link, router } from 'expo-router'


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
      <View style={styles.section}>
        <Button title="Voir les demandes d'amis" onPress={() => router.push("/friend-requests")} />
      </View>
      <View style={styles.row}>
        <TextInput
          placeholder="Rerchercher un contact"
          onChangeText={setSearch}
          value={search}
          style={styles.textInput}
        />
        <Button title="Rechercher" onPress={searchContacts} />
      </View>
      {isLoading ? (
        <Text style={styles.list}>Loading...</Text>
      ) : (
        <FlatList
          style={styles.list}
          data={contacts}
          keyExtractor={(contact) => contact.id}
          ListEmptyComponent={() => <Text>Pas encore de contact ? Faites une recherche !</Text>}
          renderItem={(contact) => (
            <ContactRow
              contact={contact.item}
            />
          )}
        />
      )}
        <StatusBar 
        backgroundColor='#161622'
        style='light'
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flex: 1,
  },
  textInput: {
    padding: 5,
    margin: 16,
    borderColor: "black",
    borderWidth: 1,
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Crew