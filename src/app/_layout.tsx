import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { PostsProvider } from '../context/PostsContext';

// Both providers wrap the whole app. PostsProvider must be inside AuthProvider.
export default function RootLayout() {
  return (
    <AuthProvider>
      <PostsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PostsProvider>
    </AuthProvider>
  );
}
