import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { appNavigationTheme } from '../theme/navigationTheme';
import type { AuthStackParamList, MainStackParamList } from './types';
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  OtpScreen,
  HomeScreen,
  ChatScreen,
  InquiriesScreen,
  ComplaintsScreen,
  CreateComplaintScreen,
  ComplaintDetailScreen,
  ProfileScreen,
} from '../screens';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
};

function AuthNavigator({ initialRoute }: { initialRoute?: 'Welcome' | 'Otp' }) {
  return (
    <AuthStack.Navigator
      screenOptions={screenOptions}
      initialRouteName={initialRoute ?? 'Welcome'}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Otp" component={OtpScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={screenOptions}>
      <MainStack.Screen name="Home" component={HomeScreen} />
      <MainStack.Screen name="Chat" component={ChatScreen} />
      <MainStack.Screen name="Inquiries" component={InquiriesScreen} />
      <MainStack.Screen name="Complaints" component={ComplaintsScreen} />
      <MainStack.Screen
        name="CreateComplaint"
        component={CreateComplaintScreen}
      />
      <MainStack.Screen
        name="ComplaintDetail"
        component={ComplaintDetailScreen}
      />
      <MainStack.Screen name="Profile" component={ProfileScreen} />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const { citizen, pendingPhone, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={appNavigationTheme}>
      {citizen ? (
        <MainNavigator />
      ) : (
        <AuthNavigator initialRoute={pendingPhone ? 'Otp' : 'Welcome'} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
