// ...existing code...
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";

interface ProfileMenuProps {
  username: string;
  onSignOut: () => void;
  onSubscription: () => void;
  theme: {
    primaryText: string;
    primary: string;
    secondaryText: string;
  };
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  username,
  onSignOut,
  onSubscription,
  theme,
}) => {
  return (
    <Menu>
      <MenuTrigger
        customStyles={{
          triggerTouchable: {
            activeOpacity: 0.5,
            underlayColor: "transparent",
          },
        }}>
        <View style={styles.initialCircle}>
          <Icon name="person" size={30} color="#8BDBC1" />
        </View>
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: { margin: 0, marginTop: 45, borderRadius: 5 },
        }}>
        <MenuOption
          customStyles={{ optionText: styles.menuOptionText }}
          onSelect={() => {
            router.push("/account-settings");
          }}>
          <View style={styles.menuOption}>
            <Icon name="manage-accounts" size={20} color={Colors.light.text} />
            <Text style={[styles.menuOptionText, { color: Colors.light.text }]}>
              Account
            </Text>
          </View>
        </MenuOption>
        <MenuOption
          onSelect={onSubscription}
          customStyles={{ optionText: styles.menuOptionText }}>
          <View style={styles.menuOption}>
            <Icon name="loyalty" size={20} color={Colors.light.text} />
            <Text style={[styles.menuOptionText, { color: Colors.light.text }]}>
              Subscription
            </Text>
          </View>
        </MenuOption>
        <MenuOption
          onSelect={onSignOut}
          customStyles={{ optionText: styles.menuOptionText }}>
          <View style={styles.menuOption}>
            <Icon name="logout" size={20} color={Colors.light.text} />
            <Text style={[styles.menuOptionText, { color: Colors.light.text }]}>
              Sign out
            </Text>
          </View>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};

const styles = StyleSheet.create({
  initialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#012524",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },
  menuOptionText: {
    marginLeft: 10,
    margin: 10,
    fontSize: 15,
    fontWeight: "500",
  },
});

export default ProfileMenu;
