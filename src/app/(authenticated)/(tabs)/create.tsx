import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePosts } from "../../../context/PostsContext";
import { showAlert } from "../../../utils/showAlert";

export default function Create() {
  const router = useRouter();
  const { addPost } = usePosts();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [posting, setPosting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.3, // lower quality keeps the upload small
      base64: true, // saves the picture data itself so it survives refresh
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

  const handlePost = async () => {
    if (!text.trim() && !image) {
      showAlert("Empty post", "Write something or add a photo first.");
      return;
    }
    setPosting(true);
    const ok = await addPost(text.trim(), image);
    setPosting(false);
    if (!ok) {
      showAlert("Post failed", "Could not reach the server. Try again.");
      return;
    }
    setText("");
    setImage(undefined);
    router.navigate("/home");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create post</Text>

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

        <TouchableOpacity
          style={styles.postBtn}
          onPress={handlePost}
          disabled={posting}
        >
          <Text style={styles.postText}>{posting ? "Posting..." : "Post"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16, color: "#111" },
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
  postBtn: {
    backgroundColor: "#e60023",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  postText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
