import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { darkTheme, lightTheme } from "@/constants/Colors";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
  onBack,
}: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onBack}
        style={[
          styles.backButton,
          {
            backgroundColor: `${theme.divider}40`,
            opacity: currentStep === 0 ? 0.5 : 1,
          },
        ]}
        disabled={currentStep === 0}>
        <Ionicons name="arrow-back" size={20} color={theme.primaryText} />
      </TouchableOpacity>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress}%`, backgroundColor: theme.primary },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 120,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  stepText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
});
