// ...existing code...
import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

interface IngredientContainerProps {
  ingredients: string[];
  deleteIngredient: (index: number) => void;
  theme: {
    primary: string;
  };
}

const IngredientContainer: React.FC<IngredientContainerProps> = ({ ingredients, deleteIngredient, theme }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View style={{ width: '100%', maxHeight: 125, minHeight: 20 }}>
      { ingredients.length > 0 && (
        <>
        <LinearGradient
          colors={[`${theme.primary}FF`, `${theme.primary}00`]}
          style={styles.gradientTop}
        />
        <ScrollView
          contentContainerStyle={styles.ingredientContainer}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {ingredients.map((ingredient, index) => {
            const displayText = ingredient.length > 40 ? `${ingredient.substring(0, 40)}...` : ingredient;
            return (
              <View key={index} style={styles.ingredient}>
                <Text style={{ padding: 8, height: '100%', borderTopLeftRadius: 4, borderBottomLeftRadius: 4, color: '#212121', fontWeight: '600', marginRight: 10, backgroundColor: '#DDDDDD'}}>
                  {`${index + 1}. `}
                </Text>
                <Text style={{ color: '#212121'}}>
                  {displayText.replace(/\b\w+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())}
                </Text>
                <TouchableOpacity 
                  onPress={() => deleteIngredient(index)}
                  style={styles.deleteButton}
                  activeOpacity={0.3}>
                  <Icon name="close" size={18} color="#888888" />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
        <LinearGradient
          colors={[`${theme.primary}00`, `${theme.primary}AA`]}
          style={styles.gradientBottom}
        />
      </>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  ingredientContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 20,
  },
  ingredient: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#fDfDfD',
    padding: 0,
    margin: 4,
    borderRadius: 4,
  },
  deleteButton: {
    marginLeft: 15,
    padding: 5,
    borderRadius: 4,
    backgroundColor: '#fDfDfD',
  },
  gradientTop: {
    position: 'absolute',
    top: 0, 
    left: 0,
    right: 0,
    height: 30,
    zIndex: 1,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 1,
  },
});

export default IngredientContainer;