import React from 'react'
import * as Contacts from "expo-contacts";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {Button, FlatList, SafeAreaView, StyleSheet, Text, TextInput, View} from "react-native";
import ContactRow from "../crewUtils/ContactRow";

const Crew = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState();

  useEffect(() => {
    const getPermission = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        searchContacts();
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

    const loadedContacts = (await Contacts.getContactsAsync(config)) || {
      data: [],
    };
    setContacts(loadedContacts.data);
    setIsLoading(false);
  };

  const editContact = async (id) => {
    await Contacts.presentFormAsync(id);
    searchContacts();
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.row}>
        <TextInput
          placeholder="Search"
          onChangeText={setSearch}
          value={search}
          style={styles.textInput}
        />
        <Button title="Search" onPress={searchContacts} />
      </View>
      {isLoading ? (
        <Text style={styles.list}>Loading...</Text>
      ) : (
        <FlatList
          style={styles.list}
          data={contacts}
          keyExtractor={(contact) => contact.id}
          ListEmptyComponent={() => <Text>No contacts!</Text>}
          renderItem={(contact) => (
            <ContactRow
              contact={contact.item}
              editContact={editContact}
            />
          )}
        />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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