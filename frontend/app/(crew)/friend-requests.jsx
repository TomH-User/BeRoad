import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { getPendingFriendRequests, acceptFriendRequest, rejectFriendRequest, getCurrentUser, getUserDetails } from "../../lib/appwrite";
import Ionicons from "react-native-vector-icons/Ionicons";
import StyledButton from '../../components/StyledButton';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [userId, setUserId] = useState(null);

  const fetchRequests = async () => {
    const user = await getCurrentUser();
    setUserId(user.accountId);

    if (user.accountId) {
        const pendingRequests = await getPendingFriendRequests(user.accountId);

        // Adding user info to requests
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
    setRequests(requests.filter((req) => req.$id !== requestId)); // Update locally
  };

  const handleReject = async (requestId) => {
    await rejectFriendRequest(requestId);
    setRequests(requests.filter((req) => req.$id !== requestId)); // Update locally
  };

  return (
    <View style={styles.container}>
      {/* Refresh icon at the top right */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Demandes d'amis</Text>
        <TouchableOpacity onPress={fetchRequests}>
          <Ionicons name="refresh" size={28} color="#FFA500" />
        </TouchableOpacity>
      </View>

      {requests.length === 0 ? (
        <Text style={styles.noRequestsText}>Aucune demande en attente</Text>
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
                <StyledButton title="Accepter" onPress={() => handleAccept(item.$id)} style={styles.acceptButton} />
                <StyledButton title="Refuser" onPress={() => handleReject(item.$id)} style={styles.rejectButton} />
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
    backgroundColor: '#161622', // Dark blue background
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFA500', // Orange color
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FFA500', // Orange border color
    paddingBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text
  },
  telephone: {
    fontSize: 14,
    color: 'gray',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 180,
  },
  acceptButton: {
    backgroundColor: '#4CAF50', // Green color for accept
    width: '48%',
  },
  rejectButton: {
    backgroundColor: '#F44336', // Red color for reject
    width: '48%',
  },
  noRequestsText: {
    color: '#FFFFFF', // White text
    textAlign: 'center',
    fontSize: 16,
  },
});

export default FriendRequests;