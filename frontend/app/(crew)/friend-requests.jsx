import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet } from "react-native";
import { getPendingFriendRequests, acceptFriendRequest, rejectFriendRequest, getCurrentUser } from "../../lib/appwrite";


const friendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      const user = await getCurrentUser();
      setUserId(user.$id);

      if (user.$id) {
        const pendingRequests = await getPendingFriendRequests(user.$id);
        setRequests(pendingRequests);
      }
    };

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
      <Text style={styles.header}>Demandes d'amis</Text>
      {requests.length === 0 ? (
        <Text>Aucune demande en attente</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <View style={styles.requestRow}>
              <Text>{item.senderName}</Text>
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
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  requestRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  buttons: { flexDirection: "row", gap: 10 },
});



export default friendRequests;