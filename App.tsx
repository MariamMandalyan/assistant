import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { AlertModalProvider } from './src/context/AlertModalContext';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
          translucent={false}
        />
        <AlertModalProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </AlertModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
