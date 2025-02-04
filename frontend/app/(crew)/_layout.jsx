import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar';
import React from 'react'

const CrewLayout = () => {
  return (
    <>
      <Stack>
          <Stack.Screen 
            name="friend-requests" 
            options={{
              headerShown: false
            }}
          />
      </Stack>
      <StatusBar backgroundColor="#161622" style="light" />
    </>
  )
}

export default CrewLayout