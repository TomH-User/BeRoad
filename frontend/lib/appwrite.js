import { Account, Avatars, Client, ID, Databases, Query } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.efrei.beroad',
    projectId: '678fd3ee0028b496b25e',
    databaseId: '678fd6c20031177026ac',
    userCollectionId: '678fd708003b945be970',
    routeCollectionId: '678fd7d4002ec0fe1566',
    checkpointCollectionId: '678fd817002aa45cd980',
    reviewCollectionId: '678fdb6e000540d0013a',
    crewCollectionId: '678fdf0a00399d03b91c',
    discussionCollectionId: '678fe04c00080f36eda5',
    messageCollectionId: '678fe10d001c61a2b195'
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
export async function createUser(email, password, username, pseudo, telephone, motoModel, socialLink, conduiteType, motoType, experiencesCommunity) {
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
                pseudo: pseudo,
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