import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { sendFriendRequest, checkFriendStatus, getCurrentUser } from '../lib/appwrite';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ContactRow = ({ contact }) => {
  const [userId, setUserId] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);

  const fetchCurrentUser = async () => {
    const user = await getCurrentUser();
    setUserId(user.accountId);
  };

  useEffect(() => {
    // Retrieve the current user
    fetchCurrentUser();

    // Check the friend status at start
    const checkStatus = async () => {
      const status = await checkFriendStatus(userId, contact.accountId);
      setFriendStatus(status);
    };

    if (userId) {
      checkStatus();
    }
  }, [contact.accountId, userId]);

  const handleAddFriend = async () => {
    console.log('userId', userId);
    console.log('contact.accountId', contact.accountId);
    try {
      if (friendStatus === 'pending') {
        alert("Demande d'ami déjà envoyée");
        return;
      }

      if (friendStatus === 'accepted') {
        alert('Vous êtes déjà amis');
        return;
      }

      await sendFriendRequest(userId, contact.accountId);
      setFriendStatus('pending');
      alert("Demande d'ami envoyée");
    } catch (error) {
      console.log(error.message);
      alert("Erreur lors de l'envoi de la demande");
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  addIcon: {
    padding: 5,
  },
  text: {
    fontSize: 16,
    color: '#FFA500', // Orange color for the contact text
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingText: {
    marginLeft: 5,
    fontSize: 14,
    color: 'orange',
  },
});

export default ContactRow;