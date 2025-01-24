import React, { useEffect, useState } from 'react'
import {ScrollView, Image, Text, View, Alert} from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'

import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { createUser, getCurrentUser } from '@/lib/appwrite'
import { signIn, signOut } from '@/lib/appwrite'
import { useGlobalContext } from '@/context/GlobalProvider'

import { images } from "../../constants";

const SignIn = () => {

  useEffect(() => {
    signOut(); 
  }, []);

  const { setUser, setIsLogged } = useGlobalContext();

  const [form, setForm] = useState({email: '', password: ''})
  
  const [isSubmitting, setSubmitting] = useState(false)
  
  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert('Error', 'Please fill all the fields')
    }
    
    setSubmitting(true);

    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLogged(true);
      
      Alert.alert('Success', 'User signed in successfully');
      router.replace("/home");  
    } catch (error) {
      Alert.alert('Error', (error as Error).message)
    } finally {
      setSubmitting(false)  
    }
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className='w-full justify-center h-full px-4 my-6 mt-8'>
        <Image
            source={images.logo}
            style = {{width: 100, height: 100}}
            resizeMode="contain"
          />

          <Text 
            className='text-2xl text-gray-100 text-semibold font-psemibold'>
            Log in to BeRoad
          </Text>

          <FormField 
            title="Email"
            value={form.email}
            handleChangeText={(e: string) => setForm({...form, email: e})}
            otherStyles='mt-7'
            keyboardType="email-address"
          />

          <FormField 
            title="Password"
            value={form.password}
            handleChangeText={(e: string) => setForm({...form, password: e})}
            otherStyles='mt-7'
          />

          <CustomButton
            title='Sign in'
            handlePress={submit}
            containerStyles='mt-7'
            isLoading={isSubmitting}
          />

          <View className='justify-center flex-row gap-2 pt-5'>
            <Text className='text-lg text-gray-100 font-pregular'>
              Don't have an account ?
            </Text>
            <Link href='/sign-up'>
              <Text className='text-lg text-secondary font-psemibold'>
                Sign up
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn