import { Stack } from 'expo-router';

// PostsProvider now lives in the root layout, so this is a plain Stack again.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
