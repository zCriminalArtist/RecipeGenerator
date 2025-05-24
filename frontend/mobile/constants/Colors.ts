/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const lightTheme = {
  primary: "#26A875",
  secondary: "#FFB74D",
  background: "#e8ecf4",
  headerBackground: "#003829",
  secondaryBackground: "#f1f3f5",
  divider: "#3B3E43",
  text: "#1d2a32",
  primaryText: "#212121",
  secondaryText: "#8A8D91",
  errorText: "#f74a4a",
  cardBackground: "#fff",
  suggestionsBackground: "#f5f5f5",
  input: {
    backgroundColor: "#fff",
    color: "#222",
    borderColor: "#C9D3DB",
  },
};

export const darkTheme = {
  primary: "#26A875",
  secondary: "#FFB74D",
  background: "#1A1D21",
  headerBackground: "#001816",
  secondaryBackground: "#2C2F33",
  divider: "#3B3E43",
  text: "#fff",
  primaryText: "#E0E0E0",
  secondaryText: "#8A8D91",
  errorText: "#f74a4a",
  cardBackground: "#202020",
  suggestionsBackground: "#222",
  input: {
    backgroundColor: "#2C2F33",
    color: "#fff",
    borderColor: "#3B3E43",
  },
};
