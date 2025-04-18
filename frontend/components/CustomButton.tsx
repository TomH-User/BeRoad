import { Text, TouchableOpacity } from 'react-native'
import React from 'react'

type CustomButtonProps = {
  title: string;
  handlePress?: any;
  containerStyles?: string;
  textStyles?: string;
  isLoading?: boolean;
};

const CustomButton: React.FC<CustomButtonProps> = ({ title, handlePress, containerStyles, textStyles, isLoading }) => {
  return (
    <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.7}
        className={`
            bg-secondary rounded-xl min-h-[62px] justify-center items-center 
            ${containerStyles} ${containerStyles} ${isLoading ? 'opacity-50' : ''}`
        }
        disabled={isLoading}
     >
      
      <Text 
        className={`text-primary font-psemibold text-lg ${textStyles}`}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

export default CustomButton