import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const StyledButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F59E0B', // Couleur de fond (vert)
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25, // Bordures arrondies
    shadowColor: '#000', // Ombre
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Pour Android
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: 200, // Largeur fixe pour un meilleur contrôle
    flex: 1,
  },
  buttonText: {
    color: '#161622', // Couleur du texte
    fontSize: 18,
    fontWeight: 'bold', // Gras
  },
});

export default StyledButton;
