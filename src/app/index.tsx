import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

// Opens the app: logged in -> Home, otherwise -> Login
export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Redirect href={user ? '/home' : '/login'} />;
}
