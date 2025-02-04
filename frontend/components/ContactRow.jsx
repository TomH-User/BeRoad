import React, { useState, useEffect } from 'react';
import { Button, Text, View, StyleSheet, ActivityIndicator} from 'react-native';
import { sendFriendRequest, checkFriendStatus, getCurrentUser } from '../lib/appwrite'; // Import de la fonction Appwrite
import Ionicons from "react-native-vector-icons/Ionicons";

export default ContactRow = ({ contact }) => {
  const [userId, setUserId] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);

  const fetchCurrentUser = async () => {
    const user = await getCurrentUser();
    setUserId(user.accountId);
  };

  useEffect(() => {
    // Récupère l'utilisateur actuel
    fetchCurrentUser();

    // Vérifie le statut de l'ami dès le départ
    const checkStatus = async () => {
      const status = await checkFriendStatus(userId, contact.accountId);
      setFriendStatus(status);
    };

    checkStatus();
  }, [contact.accountId, userId]);

  // Fonction pour envoyer une demande d'ami
  const handleAddFriend = async () => {
    console.log('userId', userId);
    console.log('contact.accountId', contact.accountId);
    try {
      if (friendStatus === 'pending') {
        alert('Demande d\'ami déjà envoyée');
        return;
      }
      
      if (friendStatus === 'accepted') {
        alert('Vous êtes déjà amis');
        return;
      }
      
      // Envoie une demande d'ami
      await sendFriendRequest(userId, contact.accountId);
      setFriendStatus('pending'); // Change le statut local pour refléter la demande en attente
      alert('Demande d\'ami envoyée');
    } catch (error) {
      console.log(error.message);
      alert('Erreur lors de l\'envoi de la demande');
    }
  };


  return (
    <View style={styles.row}>
      <Text style={styles.text}>{contact.firstName} {contact.lastName}</Text>
      
      {friendStatus === "accepted" ? (
        <Ionicons name="checkmark-circle" size={24} color="green" />
      ) : friendStatus === "pending" ? (
        <View style={styles.pendingContainer}>
          <Ionicons name="time-outline" size={24} color="orange" />
          <Text style={styles.pendingText}>En attente...</Text>
        </View>
      ) : (
        <Ionicons 
          name="add-circle" 
          size={30} 
          color="blue" 
          onPress={handleAddFriend} 
          style={styles.addIcon} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 300,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  addIcon: {
    padding: 5,
  },
  text: {
    fontSize: 16,
  },
  pendingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pendingText: {
    marginLeft: 5,
    fontSize: 14,
    color: "orange",
  },
});