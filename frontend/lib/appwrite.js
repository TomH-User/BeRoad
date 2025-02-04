import { Account, Avatars, Client, ID, Databases, Query } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.efrei.beroad',
    projectId: '678fd3ee0028b496b25e',
    databaseId: '678fd6c20031177026ac',
    userCollectionId: '678fd708003b945be970',
    routeCollectionId: '678fd7d4002ec0fe1566',
    reviewCollectionId: '678fdb6e000540d0013a',
    crewCollectionId: '678fdf0a00399d03b91c',
    discussionCollectionId: '678fe04c00080f36eda5',
    messageCollectionId: '678fe10d001c61a2b195',
    friendsCollectionId: '67a1421c001d225e13f7'
};

const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform);
    
const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register the user
export async function createUser(
    email, 
    password, 
    username, 
    telephone, 
    motoModel, 
    socialLink, 
    conduiteType,
    motoType, 
    experiencesCommunity
) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: email,
                username: username,
                telephone: telephone,
                motoModel: motoModel,
                socialLink: socialLink,
                conduiteType: conduiteType,
                motoType: motoType,
                experiencesCommunity: experiencesCommunity,
                avatar: avatarUrl
            }
        );

        return newUser;
    } catch (error) {
        console.log(error.message);
        throw new Error(error);
    }
}

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        throw new Error(error);
    }
};

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error.message);
    }
};

// Sign Out
export async function signOut() {
    try {
        const session = await account.deleteSession("current");
        return session;
    } catch (error) {
        if (error.code === 404) {
            console.warn("Aucune session active à supprimer.");
            return null;
        }
        throw new Error(error.message);
    }
}

export async function findRegisteredContacts(contacts) {
    try {
        const phoneNumbers = contacts.map(contact => contact.phoneNumbers?.[0]?.number).filter(Boolean);
        if (phoneNumbers.length === 0) return [];

        // Création des promesses pour chaque numéro de téléphone
        const queries = phoneNumbers.map(phoneNumber =>
            databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal('telephone', phoneNumber)]
            )
        );

        // Exécution des requêtes en parallèle
        const results = await Promise.all(queries);

        // Collecte tous les utilisateurs trouvés avec leur accountId
        const registeredContacts = results.reduce((acc, result) => {
            result.documents.forEach(doc => {
                acc.push({
                    ...doc, // Ajoute le document complet
                    accountId: doc.accountId // Ajoute l'accountId
                });
            });
            return acc;
        }, []);

        // Filtrage des contacts enregistrés
        const filteredContacts = contacts.filter(contact =>
            registeredContacts.some(user => user.telephone === contact.phoneNumbers?.[0]?.number)
        );

        // Ajoute l'accountId aux contacts filtrés
        const contactsWithAccountId = filteredContacts.map(contact => {
            const user = registeredContacts.find(user => user.telephone === contact.phoneNumbers?.[0]?.number);
            return {
                ...contact,
                accountId: user?.accountId // Ajoute l'accountId si trouvé
            };
        });

        return contactsWithAccountId;
    } catch (error) {
        console.log(error.message);
        return [];
    }
}

export async function checkFriendStatus(userId, friendId) {
    try {
        const friendStatus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.friendsCollectionId,
            [
                Query.equal('userId', userId),
                Query.equal('friendId', friendId)
            ]
        );

        if (friendStatus.documents.length > 0) {
            return friendStatus.documents[0].status; // "pending" ou "accepted"
        }

        return null; // Pas encore amis
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

export async function getFriends(userId) {
    try {
        const friends = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.friendsCollectionId,
            [Query.equal('userId', userId)]
        );
        return friends.documents;
    } catch (error) {
        console.log(error.message);
        return [];
    }
}

export async function sendFriendRequest(userId, friendId) {
    try {
        const existingRequest = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.friendsCollectionId,
            [
                Query.equal('userId', userId),
                Query.equal('friendId', friendId)
            ]
        );

        if (existingRequest.documents.length > 0) {
            throw new Error("Demande d'ami déjà envoyée.");
        }

        const friendRequest = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.friendsCollectionId,
            ID.unique(),
            {
                userId,
                friendId,
                status: 'pending' // En attente de validation
            }
        );

        return friendRequest;
    } catch (error) {
        console.log(error.message);
        throw new Error(error);
    }
}

export async function acceptFriendRequest(requestId) {
    try {
        const updatedRequest = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.friendsCollectionId,
            requestId,
            { status: 'accepted' }
        );

        return updatedRequest;
    } catch (error) {
        console.log(error.message);
        throw new Error(error);
    }
}

export async function rejectFriendRequest(requestId) {
    try {
        await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.friendsCollectionId,
        requestId
        );
    } catch (error) {
        console.error("Erreur lors du refus de la demande :", error.message);
    }
} 

export async function getPendingFriendRequests(userId) {
    try {
        console.log("userId get pending :", userId);
        const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.friendsCollectionId,
        [Query.equal("friendId", userId), Query.equal("status", "pending")]
      );
  
      return response.documents;
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes d'amis :", error.message);
      return [];
    }
  }

  export async function getUserDetails(userId) {
    try {
        console.log("Fetching details for user:", userId);
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", userId)]
        );

        // Vérifie si le tableau de documents n'est pas vide
        if (response.documents && response.documents.length > 0) {
            const user = response.documents[0];
            return {
                username: user.username || "Inconnu",
                telephone: user.telephone || "N/A"
            };
        } else {
            // Si aucun utilisateur n'est trouvé
            console.error("Aucun utilisateur trouvé avec l'accountId:", userId);
            return { username: "Inconnu", telephone: "N/A" };
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'utilisateur :", error.message);
        return { username: "Inconnu", telephone: "N/A" };
    }
}



export async function updateUser(updatedData) {
    try {
      const currentAccount = await account.get();
      if (!currentAccount) throw Error;
  
      // Fetch the current user's document ID
      const currentUser = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal('accountId', currentAccount.$id)]
      );
  
      if (currentUser.documents.length === 0) {
        throw new Error('User document not found.');
      }
  
      const userId = currentUser.documents[0].$id;
  
      // Update user document with new data
      const updatedUser = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId,
        updatedData
      );
  
      return updatedUser;
    } catch (error) {
      console.log(error.message);
      throw new Error(error);
    }
}


