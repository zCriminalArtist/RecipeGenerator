// ...existing code...
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

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

const ProfileMenu: React.FC<ProfileMenuProps> = ({ username, onSignOut, onSubscription, theme }) => {
  return (
    <Menu>
      <MenuTrigger>
        <View style={styles.initialCircle}>
          <Text style={[styles.initialText, { color: theme.primary }]}>
            {username.charAt(0).toUpperCase()}
          </Text>
        </View>
      </MenuTrigger>
      <MenuOptions customStyles={{ optionsContainer: { marginTop: 45 } }}>
        <MenuOption onSelect={onSubscription} customStyles={{ optionText: styles.menuOptionText }}>
          <View style={styles.menuOption}>
            <Icon name="loyalty" size={20} color={theme.secondaryText} />
            <Text style={[styles.menuOptionText, { color: theme.secondaryText }]}>Subscription</Text>
          </View>
        </MenuOption>
        <MenuOption onSelect={onSignOut} customStyles={{ optionText: styles.menuOptionText }}>
          <View style={styles.menuOption}>
            <Icon name="logout" size={20} color={theme.secondaryText} />
            <Text style={[styles.menuOptionText, { color: theme.secondaryText }]}>Sign out</Text>
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
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuOptionText: {
    margin: 10,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ProfileMenu;