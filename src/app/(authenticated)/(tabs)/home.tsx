import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { Post, usePosts } from "../../../context/PostsContext";
import { showAlert } from "../../../utils/showAlert";

function PostCard({
  post,
  canModify,
  onEdit,
  onDelete,
  onPress,
}: {
  post: Post;
  canModify: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.username[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{post.username}</Text>
        {canModify && (
          <>
            <TouchableOpacity style={styles.deleteBtn} onPress={onEdit}>
              <Ionicons name="create-outline" size={20} color="#111" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color="#e60023" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {!!post.text && <Text style={styles.text}>{post.text}</Text>}
      {post.edited && <Text style={styles.edited}>(edited)</Text>}

      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      )}

      <View style={styles.actions}>
        <Ionicons name="heart-outline" size={24} color="#111" />
        <Text style={styles.count}>{post.likes}</Text>
        <Ionicons
          name="chatbubble-outline"
          size={22}
          color="#111"
          style={{ marginLeft: 16 }}
        />
        <Text style={styles.count}>{post.comments}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Home() {
  const router = useRouter();
  const { posts, loading, error, refreshPosts, deletePost } = usePosts();
  const { user } = useAuth();

  const runDelete = async (id: string) => {
    const ok = await deletePost(id);
    if (!ok)
      showAlert("Delete failed", "Could not delete the post. Try again.");
  };

  const confirmDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this post?")) {
        runDelete(id);
      }
      return;
    }
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => runDelete(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Home</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            canModify={item.username === user?.username}
            onEdit={() => router.push(`/post/${item.id}?edit=1`)}
            onDelete={() => confirmDelete(item.id)}
            onPress={() => router.push(`/post/${item.id}`)}
          />
        )}
        refreshing={loading}
        onRefresh={refreshPosts}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading
              ? "Loading posts..."
              : error || "No posts yet. Create one!"}
          </Text>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  title: { fontSize: 22, fontWeight: "700", padding: 16, color: "#111" },
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e60023",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  username: { fontWeight: "700", fontSize: 15, color: "#111", flex: 1 },
  deleteBtn: { padding: 6 },
  text: { fontSize: 15, color: "#222", marginBottom: 10 },
  edited: { fontSize: 12, color: "#888", marginBottom: 8 },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
  },
  actions: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  count: { marginLeft: 6, color: "#444" },
});
