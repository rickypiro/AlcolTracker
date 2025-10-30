import { Stack } from 'expo-router';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { BACProvider } from '@/contexts/BACContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <BACProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </BACProvider>
    </SettingsProvider>
  );
}