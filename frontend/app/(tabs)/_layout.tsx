import { View, Text, Image, ImageSourcePropType } from 'react-native'
import {Tabs, Redirect} from 'expo-router';

import { icons } from '../../constants';

type TabIconProps = {
  icon: ImageSourcePropType;
  color: string;
  name: string;
  focused: boolean;
};

const TabIcon: React.FC<TabIconProps> = ({ icon, color, name, focused }) =>{
  return (
  <View className="items-center w-[80px]">
      <Image 
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className='w-6 h-6'
      />
      <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`} style={{color: color}}>
        {name}
      </Text>
    </View>
  )
}

const TabsLayout = () => {
  return (
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#FFA001',
          tabBarInactiveTintColor: '#CDCDE0',
          tabBarStyle: {
            backgroundColor: '#161622',
            borderTopWidth: 1,
            borderTopColor: '#232533',
            height: 55,
          }
        }}
      >
        <Tabs.Screen 
          name="accueil"
          options={{
            title: 'Accueil',
            headerShown: false,
            tabBarIcon: ({ color, focused}) => (
              <TabIcon 
                icon={icons.home}
                color={color}
                name="Accueil"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name="meteo"
          options={{
            title: 'Metéo',
            headerShown: false,
            tabBarIcon: ({ color, focused}) => (
              <TabIcon 
                icon={icons.bookmark}
                color={color}
                name="Meteo"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name="crew"
          options={{
            title: 'Crew',
            headerShown: false,
            tabBarIcon: ({ color, focused}) => (
              <TabIcon 
                icon={icons.plus}
                color={color}
                name="Crew"
                focused={focused}
              />
            )
          }}
        />

        <Tabs.Screen 
          name="profil"
          options={{
            title: 'Profil',
            headerShown: false,
            tabBarIcon: ({ color, focused}) => (
              <TabIcon 
                icon={icons.profile}
                color={color}
                name="Profil"
                focused={focused}
              />
            )
          }}
        />

      </Tabs>
  )
}

export default TabsLayout