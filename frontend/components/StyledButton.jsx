import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const StyledButton = ({ title, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F59E0B', // Background color (orange)
    paddingVertical: 12,
    borderRadius: 25, // Rounded borders
    shadowColor: '#000', // Shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // For Android
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    // Removed fixed width
    flexDirection: 'row',
  },
  buttonText: {
    color: '#161622', // Text color
    fontSize: 18,
    fontWeight: 'bold', // Bold
  },
});

export default StyledButton;