import { StatusBar } from "expo-status-bar";
import {ScrollView, Text, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "../components/CustomButton";
import { Redirect, router} from 'expo-router';
import 'react-native-url-polyfill/auto'

import { images } from "../constants";
import { useGlobalContext } from "@/context/GlobalProvider";

export default function App() {
  const {isLoading, isLoggedIn} = useGlobalContext();

  if (!isLoading && isLoggedIn) 
    return <Redirect href="/home"/>;


  return (
    <SafeAreaView className=" bg-primary h-full">
      <ScrollView contentContainerStyle={{height: '100%'}}>
        <View className="w-full min-h-[85vh] justify-center items-center px-4">
        
          <Image
            source={images.logo}
            className="w-[400px] h-[250px]"
            resizeMode="contain"
          />

          <View className="relative mt-1">
            <Text className="text-2xl text-white font-bold text-center">
              Ensemble, parcourons la {''}<Text className="text-secondary-200">Route</Text>
            </Text>

          <Image
            source={images.path}
            className="w-[136px] h-[10px] absolute -bottom-2 -right-10"
            resizeMode="contain"
          />
          </View>
          <CustomButton 
            title="Continuer avec son Email"
            handlePress={() => {router.push('/sign-in')}}
            containerStyles="w-full mt-8"
          />

        </View> 

      <StatusBar 
        backgroundColor='#161622'
        style='light'
      />
      </ScrollView>
    </SafeAreaView>
  );
}
