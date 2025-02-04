import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, Text, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';

import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { updateUser, getCurrentUser } from '@/lib/appwrite';

type FormState = {
  username: string;
  email: string;
  telephone: string;
  motoModel: string;
  socialLink: string;
  conduiteType: string[];
  motoType: string[];
  experiencesCommunity: string[];
};

const EditProfile = () => {
  const { user, setUser } = useGlobalContext();
  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    telephone: '',
    motoModel: '',
    socialLink: '',
    conduiteType: [],
    motoType: [],
    experiencesCommunity: [],
  });

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setForm({
          username: currentUser.username,
          email: currentUser.email,
          telephone: currentUser.telephone,
          motoModel: currentUser.motoModel,
          socialLink: currentUser.socialLink,
          conduiteType: currentUser.conduiteType,
          motoType: currentUser.motoType,
          experiencesCommunity: currentUser.experiencesCommunity,
        });
      }
    }
    fetchUser();
  }, []);

  const toggleOption = (field: keyof FormState, value: string) => {
    setForm((prevState) => {
      const isActive = prevState[field].includes(value);
      const updatedList = isActive
        ? (prevState[field] as string[]).filter((item) => item !== value)
        : [...(prevState[field] as string[]), value];
      return { ...prevState, [field]: updatedList };
    });
  };

  const handleSubmit = async () => {
    try {
      const updatedUser = await updateUser(form);
      setUser(updatedUser);
      Alert.alert('Succès', 'Votre profil a été mis à jour.');
      router.back();
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour du profil.');
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center h-full px-4 my-6 mt-8">
          <Text className="text-2xl text-gray-100 text-semibold font-psemibold">
            Modifier le Profil
          </Text>

          <FormField
            title="Nom d'utilisateur"
            value={form.username}
            handleChangeText={(e: string) => setForm({ ...form, username: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="E-mail"
            value={form.email}
            handleChangeText={(e: string) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Téléphone"
            value={form.telephone}
            handleChangeText={(e: string) => setForm({ ...form, telephone: e })}
            otherStyles="mt-7"
            keyboardType="phone-pad"
          />

          <FormField
            title="Modèle de la moto"
            value={form.motoModel}
            handleChangeText={(e: string) => setForm({ ...form, motoModel: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Lien vers réseau social"
            value={form.socialLink}
            handleChangeText={(e: string) =>
              setForm({ ...form, socialLink: e })
            }
            otherStyles="mt-7"
            keyboardType="url"
          />

          <Text className="text-lg text-gray-100 mt-7">Type de conduite:</Text>
          {[
            'Balades tranquilles',
            'Road trips longue distance',
            'Conduite sportive',
            'Off-road / Tout-terrain',
            'Moto urbaine',
          ].map((type) => (
            <View key={type} className="flex-row items-center">
              <Switch
                value={form.conduiteType.includes(type)}
                onValueChange={() => toggleOption('conduiteType', type)}
              />
              <Text className="text-lg text-gray-100">{type}</Text>
            </View>
          ))}

          <Text className="text-lg text-gray-100 mt-7">
            Type de moto préférée:
          </Text>
          {[
            'Roadster',
            'Sportive',
            'Custom / Cruiser',
            'Trail / Adventure',
            'Touring',
            'Café racer / Vintage',
          ].map((type) => (
            <View key={type} className="flex-row items-center">
              <Switch
                value={form.motoType.includes(type)}
                onValueChange={() => toggleOption('motoType', type)}
              />
              <Text className="text-lg text-gray-100">{type}</Text>
            </View>
          ))}

          <Text className="text-lg text-gray-100 mt-7">
            Expériences et communauté:
          </Text>
          {[
            "Rencontrer d'autres motards",
            "Participer à des événements moto",
            "Découvrir de nouveaux itinéraires",
            "Voyager à l’étranger en moto",
            "Conduite en groupe",
          ].map((experience) => (
            <View key={experience} className="flex-row items-center">
              <Switch
                value={form.experiencesCommunity.includes(experience)}
                onValueChange={() =>
                  toggleOption('experiencesCommunity', experience)
                }
              />
              <Text className="text-lg text-gray-100">{experience}</Text>
            </View>
          ))}

          <CustomButton
            title="Mettre à jour"
            handlePress={handleSubmit}
            containerStyles="mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;