import React, { useState } from 'react'
import {ScrollView, Image, Text, View, Alert } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'

import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { images } from "../../constants";
import { createUser } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'


const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();

  const [form, setForm] = useState({
    username: '',
    email: '', 
    password: ''
  })

  const [isSubmitting, setSubmitting] = useState(false)
  
  const submit = async () => {
    if (form.username === "" || form.email === "" || form.password === "") {
      Alert.alert('Error', 'Please fill all the fields')
    }

    setSubmitting(true);
    try {
      const result = await createUser(form.email, form.password, form.username);
      setUser(result);
      setIsLogged(true);

      router.replace("/home");
    } catch (error) {
      Alert.alert('Error', (error as Error).message)
    } finally {
      setSubmitting(false);
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
            Sign Up to BeRoad
          </Text>

          <FormField 
            title="Username"
            value={form.username}
            handleChangeText={(e: string) => setForm({...form, username: e})}
            otherStyles='mt-7'
          />

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
            title='Sign up'
            handlePress={submit}
            containerStyles='mt-7'
            isLoading={isSubmitting}
          />

          <View className='justify-center flex-row gap-2 pt-5'>
            <Text className='text-lg text-gray-100 font-pregular'>
              Have an account already ?
            </Text>
            <Link href='/sign-in'>
              <Text className='text-lg text-secondary font-psemibold'>
                Sign in
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignUp