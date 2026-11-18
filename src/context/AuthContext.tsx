import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  name: string;
  username: string;
  email: string;
  password: string;
  location: string;
  birthday: string;
  bio: string;
};

export type ProfileUpdate = Partial<Pick<User, 'name' | 'username' | 'location' | 'birthday' | 'bio'>>;

type Result = { ok: boolean; error?: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<Result>;
  login: (email: string, password: string) => Promise<Result>;
  logout: () => Promise<void>;
  updateProfile: (changes: ProfileUpdate) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = 'users';
const SESSION_KEY = 'currentUserEmail';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved users and the logged-in session when the app starts
  useEffect(() => {
    const load = async () => {
      try {
        const savedUsers = await AsyncStorage.getItem(USERS_KEY);
        const list: User[] = savedUsers ? JSON.parse(savedUsers) : [];
        setUsers(list);
        const email = await AsyncStorage.getItem(SESSION_KEY);
        if (email) setUser(list.find((u) => u.email === email) ?? null);
      } catch (e) {
        console.log('Failed to load auth data', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveUsers = async (list: User[]) => {
    setUsers(list);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(list));
  };

  const register = async (name: string, email: string, password: string): Promise<Result> => {
    const cleanEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email === cleanEmail)) {
      return { ok: false, error: 'That email is already registered.' };
    }
    const newUser: User = {
      name: name.trim(),
      username: cleanEmail.split('@')[0],
      email: cleanEmail,
      password,
      location: '',
      birthday: '',
      bio: '',
    };
    await saveUsers([...users, newUser]);
    return { ok: true };
  };

  const login = async (email: string, password: string): Promise<Result> => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email === cleanEmail && u.password === password);
    if (!found) return { ok: false, error: 'Wrong email or password.' };
    setUser(found);
    await AsyncStorage.setItem(SESSION_KEY, found.email);
    return { ok: true };
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  };

  const updateProfile = async (changes: ProfileUpdate) => {
    if (!user) return;
    const updated = { ...user, ...changes };
    setUser(updated);
    await saveUsers(users.map((u) => (u.email === user.email ? updated : u)));
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
