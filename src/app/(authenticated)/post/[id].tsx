import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { usePosts } from "../../../context/PostsContext";
import { showAlert } from "../../../utils/showAlert";

export default function PostDetail() {
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const router = useRouter();
  const { posts, deletePost, editPost } = usePosts();
  const { user } = useAuth();

  const post = posts.find((p) => p.id === id);
  const isMine = !!post && post.username === user?.username;

  // Edit mode state
  const [editing, setEditing] = useState(edit === "1");
  const [text, setText] = useState(post?.text ?? "");
  const [image, setImage] = useState<string | undefined>(post?.image);

  const startEdit = () => {
    setText(post?.text ?? "");
    setImage(post?.image);
    setEditing(true);
  };

  const cancelEdit = () => {
    setText(post?.text ?? "");
    setImage(post?.image);
    setEditing(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.3,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage(
        asset.base64
          ? `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`
          : asset.uri,
      );
    }
  };

  const saveEdit = async () => {
    if (!text.trim() && !image) {
      showAlert("Empty post", "A post needs some text or a photo.");
      return;
    }
    const ok = await editPost(post!.id, { text: text.trim(), image });
    if (!ok) {
      showAlert("Save failed", "Could not reach the server. Try again.");
      return;
    }
    setEditing(false);
  };

  const handleDelete = () => {
    const doDelete = async () => {
      const ok = await deletePost(post!.id);
      if (ok) router.back();
      else showAlert("Delete failed", "Could not delete the post.");
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this post?"))
        doDelete();
      return;
    }
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: doDelete },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={26} color="#111" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{editing ? "Edit post" : "Post"}</Text>
        <View style={styles.rightIcons}>
          {isMine && !editing ? (
            <>
              <TouchableOpacity onPress={startEdit} style={styles.iconBtn}>
                <Ionicons name="create-outline" size={24} color="#111" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={24} color="#e60023" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.iconBtn} />
          )}
        </View>
      </View>

      {!post ? (
        <Text style={styles.empty}>This post no longer exists.</Text>
      ) : editing && isMine ? (
        /* ---------- Edit mode ---------- */
        <ScrollView
          contentContainerStyle={styles.editBody}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#999"
            multiline
            value={text}
            onChangeText={setText}
          />

          {image && (
            <View>
              <Image source={{ uri: image }} style={styles.preview} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => setImage(undefined)}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
            <Ionicons name="image-outline" size={22} color="#e60023" />
            <Text style={styles.photoText}>
              {image ? "Change photo" : "Add photo"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
            <Text style={styles.saveText}>Save changes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={cancelEdit}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* ---------- View mode ---------- */
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {post.image && (
            <Image
              source={{ uri: post.image }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          <View style={styles.body}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.username[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.username}>{post.username}</Text>
            </View>

            {!!post.text && <Text style={styles.text}>{post.text}</Text>}
            {post.edited && <Text style={styles.edited}>(edited)</Text>}

            <View style={styles.actions}>
              <Ionicons name="heart-outline" size={26} color="#111" />
              <Text style={styles.count}>{post.likes}</Text>
              <Ionicons
                name="chatbubble-outline"
                size={24}
                color="#111"
                style={{ marginLeft: 20 }}
              />
              <Text style={styles.count}>{post.comments}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  rightIcons: {
    flexDirection: "row",
    minWidth: 44,
    justifyContent: "flex-end",
  },
  topTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
  image: { width: "100%", height: 360, backgroundColor: "#e5e5e5" },
  body: { padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e60023",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  username: { fontWeight: "700", fontSize: 17, color: "#111" },
  text: { fontSize: 17, lineHeight: 24, color: "#222", marginBottom: 8 },
  edited: { fontSize: 12, color: "#888", marginBottom: 12 },
  actions: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  count: { marginLeft: 6, color: "#444", fontSize: 15 },

  // edit mode
  editBody: { padding: 16 },
  input: {
    backgroundColor: "#f1f1f1",
    borderRadius: 16,
    padding: 14,
    minHeight: 120,
    fontSize: 16,
    textAlignVertical: "top",
  },
  preview: { width: "100%", height: 220, borderRadius: 12, marginTop: 12 },
  removeBtn: {
    position: "absolute",
    top: 20,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  photoBtn: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  photoText: {
    marginLeft: 8,
    color: "#e60023",
    fontWeight: "600",
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: "#e60023",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cancelText: {
    color: "#e60023",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 18,
  },
});
