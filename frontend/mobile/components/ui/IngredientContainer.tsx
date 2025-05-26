import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

interface IngredientContainerProps {
  ingredients: string[];
  deleteIngredient: (index: number) => void;
  theme: {
    primary: string;
    headerBackground: string;
  };
}

const IngredientContainer: React.FC<IngredientContainerProps> = ({
  ingredients,
  deleteIngredient,
  theme,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  // Track animation values for each ingredient
  const [fadeAnims, setFadeAnims] = useState<Animated.Value[]>([]);

  // Update animation values when ingredients change
  useEffect(() => {
    // If we have more ingredients than animations, create new ones
    if (ingredients.length > fadeAnims.length) {
      const newAnims = [...fadeAnims];

      // Add new animated values for each new ingredient
      for (let i = fadeAnims.length; i < ingredients.length; i++) {
        newAnims.push(new Animated.Value(0)); // Start with opacity 0
      }

      setFadeAnims(newAnims);

      // Animate the new ingredients
      setTimeout(() => {
        // Animate the most recently added ingredient
        Animated.timing(newAnims[newAnims.length - 1], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 50);
    }
    // If ingredients were removed, remove their animations too
    else if (ingredients.length < fadeAnims.length) {
      setFadeAnims(fadeAnims.slice(0, ingredients.length));
    }
  }, [ingredients.length]);

  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: 20,
        maxHeight: 125,
        minHeight: 20,
      }}>
      {ingredients.length > 0 && (
        <>
          <LinearGradient
            colors={[
              `${theme.headerBackground}FF`,
              `${theme.headerBackground}00`,
            ]}
            style={styles.gradientTop}
          />
          <ScrollView
            contentContainerStyle={styles.ingredientContainer}
            ref={scrollViewRef}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }>
            {ingredients.map((ingredient, index) => {
              const displayText =
                ingredient.length > 40
                  ? `${ingredient.substring(0, 40)}...`
                  : ingredient;
              // Wrap each ingredient View with an Animated.View
              return (
                <Animated.View
                  key={index}
                  style={{
                    opacity: fadeAnims[index] || 1, // Use animation value or default to 1
                    transform: [
                      {
                        translateY:
                          fadeAnims[index]?.interpolate({
                            inputRange: [0, 1],
                            outputRange: [5, 0], // Slight upward movement as it fades in
                          }) || 0,
                      },
                    ],
                  }}>
                  <View style={styles.ingredient}>
                    <Text
                      style={{
                        padding: 8,
                        height: "100%",
                        borderTopLeftRadius: 6,
                        borderBottomLeftRadius: 6,
                        color: "#212121",
                        fontWeight: "600",
                        marginRight: 10,
                        backgroundColor: "#DDDDDD",
                      }}>
                      {`${index + 1}. `}
                    </Text>
                    <Text style={{ color: "#212121" }}>
                      {displayText.replace(
                        /\b\w+/g,
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )}
                    </Text>
                    <TouchableOpacity
                      onPress={() => deleteIngredient(index)}
                      style={styles.deleteButton}
                      activeOpacity={0.3}>
                      <Icon name="close" size={18} color="#888888" />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>
          <LinearGradient
            colors={[
              `${theme.headerBackground}00`,
              `${theme.headerBackground}AA`,
            ]}
            style={styles.gradientBottom}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ingredientContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 25,
  },
  ingredient: {
    flexDirection: "row",
    alignItems: "center",
    textAlignVertical: "center",
    backgroundColor: "#fDfDfD",
    padding: 0,
    margin: 4,
    borderRadius: 6,
  },
  deleteButton: {
    marginLeft: 15,
    padding: 5,
    borderRadius: 6,
    backgroundColor: "#fDfDfD",
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 1,
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 1,
  },
});

export default IngredientContainer;
