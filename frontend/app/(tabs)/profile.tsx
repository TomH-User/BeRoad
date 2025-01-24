import React from 'react'
import { router } from 'expo-router';
import { Text, View, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGlobalContext } from '@/context/GlobalProvider';
import InfoBox from '@/components/InfoBox';
import { signOut } from '@/lib/appwrite';

import { icons } from '../../constants';


const Profile = () => {

  const { user, setUser, setIsLogged } = useGlobalContext();

  // const user_id = user.$id;

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace("/sign-in");
  }

  return (
    <SafeAreaView className="bg-primary h-full">
        <View className="w-full justify-center items-center mt-6 mb-12 px-4">
          <TouchableOpacity 
            onPress = {logout}
            className="flex w-full items-end mb-10">
            <Image 
              source= {icons.logout} 
              resizeMode = "contain"
              className = "w-6 h-6" />
          </TouchableOpacity>

          <View className='w-16 h-16 border border-secondary rounded-lg flex justify-center items-center'>
            <Image
              source={{uri: user?.avatar}}
              className="w-[90%] h-[90%] rounded-lg"
              resizeMode='cover'/>
          </View>

          <Text className="text-2xl text-gray-100 text-semibold font-psemibold mt-4">
            {user?.name}
          </Text>
        </View>
    </SafeAreaView>
  );
};

export default Profile;