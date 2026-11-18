import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';

function DetailRow({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color="#e60023" />
      <Text style={styles.rowText}>{label}</Text>
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  const [birthday, setBirthday] = useState('');
  const [bio, setBio] = useState('');

  if (!user) return null;

  const openEdit = () => {
    setName(user.name);
    setUsername(user.username);
    setLocation(user.location);
    setBirthday(user.birthday);
    setBio(user.bio);
    setEditing(true);
  };

  const saveEdit = async () => {
    await updateProfile({
      name: name.trim() || user.name,
      username: username.trim() || user.username,
      location,
      birthday,
      bio,
    });
    setEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.name[0]?.toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.username}>@{user.username}</Text>
      {!!user.bio && <Text style={styles.bio}>{user.bio}</Text>}

      <TouchableOpacity style={styles.editButton} onPress={openEdit}>
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>

      <View style={styles.details}>
        <DetailRow icon="mail-outline" label={user.email} />
        <DetailRow icon="location-outline" label={user.location || 'No location yet'} />
        <DetailRow icon="calendar-outline" label={user.birthday || 'No birthday yet'} />
      </View>

      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.logout}>Log out</Text>
      </TouchableOpacity>

      <Modal visible={editing} animationType="slide" onRequestClose={() => setEditing(false)}>
        <SafeAreaView style={styles.modal}>
          <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Edit profile</Text>
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
            <TextInput style={styles.input} placeholder="Birthday" value={birthday} onChangeText={setBirthday} />
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Bio"
              multiline
              value={bio}
              onChangeText={setBio}
            />
            <TouchableOpacity style={styles.editButton} onPress={saveEdit}>
              <Text style={styles.editText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditing(false)}>
              <Text style={[styles.logout, { textAlign: 'center' }]}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#fff', paddingTop: 32 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e60023',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 48, fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '700', marginTop: 14, color: '#111' },
  username: { color: '#666', marginTop: 2 },
  bio: { color: '#444', marginTop: 10, textAlign: 'center', paddingHorizontal: 32 },
  editButton: {
    backgroundColor: '#e60023',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 18,
    alignItems: 'center',
  },
  editText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  details: {
    alignSelf: 'stretch',
    marginHorizontal: 24,
    marginTop: 28,
    backgroundColor: '#f6f6f6',
    borderRadius: 16,
    padding: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  rowText: { marginLeft: 12, fontSize: 15, color: '#222' },
  logout: { color: '#e60023', fontWeight: '700', marginTop: 24 },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#111' },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
});
