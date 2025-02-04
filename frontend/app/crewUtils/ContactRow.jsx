import React, { useState, useEffect } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import { sendFriendRequest, checkFriendStatus, getCurrentUser } from '../../lib/appwrite'; // Import de la fonction Appwrite


export default ContactRow = ({ contact }) => {
  const [userId, setUserId] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);

  const fetchCurrentUser = async () => {
    const user = await getCurrentUser();
    setUserId(user.$id);
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
    console.log('friendStatus', friendStatus);
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
      <Text>{contact.firstName} {contact.lastName}</Text>
      {friendStatus === 'accepted' ? (
        <Text>Amis</Text>
      ) : (
        <Button title="Ajouter ami" onPress={handleAddFriend} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});
