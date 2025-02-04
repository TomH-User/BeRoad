import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { getPendingFriendRequests, acceptFriendRequest, rejectFriendRequest, getCurrentUser, getUserDetails } from "../../lib/appwrite";
import Ionicons from "react-native-vector-icons/Ionicons";


const friendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [userId, setUserId] = useState(null);

  const fetchRequests = async () => {
    const user = await getCurrentUser();
    setUserId(user.accountId);

    if (user.accountId) {
        const pendingRequests = await getPendingFriendRequests(user.accountId);

        // Ajout des infos utilisateurs dans les demandes
        const requestsWithDetails = await Promise.all(
            pendingRequests.map(async (request) => {
                const userDetails = await getUserDetails(request.userId);
                return { ...request, username: userDetails.username, telephone: userDetails.telephone };
            })
        );
        setRequests(requestsWithDetails);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    await acceptFriendRequest(requestId);
    setRequests(requests.filter((req) => req.$id !== requestId)); // Mise à jour locale
  };

  const handleReject = async (requestId) => {
    await rejectFriendRequest(requestId);
    setRequests(requests.filter((req) => req.$id !== requestId)); // Mise à jour locale
  };

  return (
    <View style={styles.container}>
      {/* Icône d'actualisation en haut à droite */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Demandes d'amis</Text>
        <TouchableOpacity onPress={fetchRequests}>
          <Ionicons name="refresh" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {requests.length === 0 ? (
        <Text>Aucune demande en attente</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <View style={styles.requestRow}>
              <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.telephone}>{item.telephone}</Text>
              </View>
              <View style={styles.buttons}>
                <Button title="Accepter" onPress={() => handleAccept(item.$id)} />
                <Button title="Refuser" color="red" onPress={() => handleReject(item.$id)} />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  telephone: {
    fontSize: 14,
    color: 'gray',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 185,
  },
});

export default friendRequests;