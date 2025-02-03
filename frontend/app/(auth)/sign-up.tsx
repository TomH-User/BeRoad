import React, { useState } from "react";
import { ScrollView, Image, Text, View, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";

import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { images } from "../../constants";
import { createUser } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

type FormState = {
  username: string;
  email: string;
  password: string;
  pseudo: string;
  telephone: string;
  motoModel: string;
  socialLink: string;
  conduiteType: string[];
  motoType: string[];
  experiencesCommunity: string[];
};

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();

  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    pseudo: "",
    telephone: "",
    motoModel: "",
    socialLink: "",
    conduiteType: [],
    motoType: [],
    experiencesCommunity: [],
  });

  const [isSubmitting, setSubmitting] = useState(false);

  const toggleOption = (field: keyof FormState, value: string) => {
    setForm((prevState) => {
      const isActive = prevState[field].includes(value);
      const updatedList = isActive
        ? (prevState[field] as string[]).filter((item) => item !== value)
        : [...(prevState[field] as string[]), value];
      return { ...prevState, [field]: updatedList };
    });
  };

  const submit = async () => {
    const { username, email, password, pseudo, telephone } = form;
    if (!username || !email || !password || !pseudo || !telephone) {
      Alert.alert("Erreur", "Merci de renseigner les champs obligatoires (*)");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createUser(form.email, form.password, form.username);
      setUser(result);
      setIsLogged(true);
      router.replace("/ride");
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center h-full px-4 my-6 mt-8">
          <Image
            source={images.logo}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
          />

          <Text className="text-2xl text-gray-100 text-semibold font-psemibold">
            S'inscrire à BeRoad
          </Text>

          <FormField
            title="Nom d'utilisateur *"
            value={form.username}
            handleChangeText={(e: string) => setForm({ ...form, username: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="E-mail *"
            value={form.email}
            handleChangeText={(e: string) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Mot de passe *"
            value={form.password}
            handleChangeText={(e: string) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Pseudo *"
            value={form.pseudo}
            handleChangeText={(e: string) => setForm({ ...form, pseudo: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Téléphone *"
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
            "Balades tranquilles",
            "Road trips longue distance",
            "Conduite sportive",
            "Off-road / Tout-terrain",
            "Moto urbaine",
          ].map((type) => (
            <View key={type} className="flex-row items-center">
              <Switch
                value={form.conduiteType.includes(type)}
                onValueChange={() => toggleOption("conduiteType", type)}
              />
              <Text className="text-lg text-gray-100">{type}</Text>
            </View>
          ))}

          <Text className="text-lg text-gray-100 mt-7">
            Type de moto préférée:
          </Text>
          {[
            "Roadster",
            "Sportive",
            "Custom / Cruiser",
            "Trail / Adventure",
            "Touring",
            "Café racer / Vintage",
          ].map((type) => (
            <View key={type} className="flex-row items-center">
              <Switch
                value={form.motoType.includes(type)}
                onValueChange={() => toggleOption("motoType", type)}
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
                  toggleOption("experiencesCommunity", experience)
                }
              />
              <Text className="text-lg text-gray-100">{experience}</Text>
            </View>
          ))}

          <CustomButton
            title="S'inscrire"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="justify-center flex-row gap-2 pt-5">
            <Text className="text-lg text-gray-100 font-pregular">
              Vous disposez déjà d'un compte ?
            </Text>
            <Link href="/sign-in">
              <Text className="text-lg text-secondary font-psemibold">
                Sign in
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
