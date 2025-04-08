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
      <MenuTrigger
      customStyles={{ triggerTouchable: { activeOpacity: 0.5, underlayColor: 'transparent' } }}
      >
      <View style={styles.initialCircle}>
        <Icon name="person" size={30} color={theme.primary} />
      </View>
      </MenuTrigger>
      <MenuOptions customStyles={{ optionsContainer: { padding: 5, marginTop: 45 } }}>
      <MenuOption customStyles={{ optionText: styles.menuOptionText }}>
        <View style={styles.menuOption}>
        <Icon name="manage-accounts" size={20} color={theme.secondaryText} />
        <Text style={[styles.menuOptionText, { color: theme.secondaryText }]}>Account</Text>
        </View>
      </MenuOption>
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