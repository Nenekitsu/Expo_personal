import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const API_URL =
  "https://6af3f9fe55a1de7dcf03745a.mockapi.io/api/products/items";

export type Post = {
  id: string;
  username: string;
  text: string;
  image?: string;
  likes: number;
  comments: number;
  edited?: boolean;
};

// What one item looks like in the API (extra fields are optional)
type ApiItem = {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  username?: string;
  text?: string;
  likes?: number;
  edited?: boolean;
};

// Turn an API item into a Post for the screens
const toPost = (item: ApiItem): Post => ({
  id: String(item.id),
  username: item.username || item.name || "unknown",
  text: item.text || item.description || "",
  image:
    item.image && /^(https?:|data:image)/.test(item.image)
      ? item.image
      : undefined,
  likes: item.likes ?? 0,
  comments: 0,
  edited: item.edited ?? false,
});

type PostsContextType = {
  posts: Post[];
  loading: boolean;
  error: string;
  refreshPosts: () => Promise<void>;
  addPost: (text: string, image?: string) => Promise<boolean>;
  editPost: (
    id: string,
    changes: { text: string; image?: string },
  ) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
};

const PostsContext = createContext<PostsContextType | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET: load all posts from the API (newest first)
  const refreshPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: ApiItem[] = await res.json();
      setPosts(data.map(toPost).reverse());
      setError("");
    } catch (e) {
      console.log("Failed to load posts", e);
      setError(
        "Could not load posts. Check your internet and pull down to retry.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  // POST: create a new post on the server
  const addPost = async (text: string, image?: string): Promise<boolean> => {
    const username = user?.username ?? "guest";
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          description: text,
          username,
          text,
          image: image ?? "",
          likes: 0,
          edited: false,
        }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const created: ApiItem = await res.json();
      setPosts((prev) => [toPost(created), ...prev]);
      return true;
    } catch (e) {
      console.log("Failed to create post", e);
      return false;
    }
  };

  // PUT: update an existing post on the server
  const editPost = async (
    id: string,
    changes: { text: string; image?: string },
  ): Promise<boolean> => {
    const old = posts.find((p) => p.id === id);
    if (!old) return false;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: old.username,
          description: changes.text,
          username: old.username,
          text: changes.text,
          image: changes.image ?? "",
          likes: old.likes,
          edited: true,
        }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const updated: ApiItem = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === id ? toPost(updated) : p)));
      return true;
    } catch (e) {
      console.log("Failed to edit post", e);
      return false;
    }
  };

  // DELETE: remove a post from the server
  const deletePost = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (e) {
      console.log("Failed to delete post", e);
      return false;
    }
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        error,
        refreshPosts,
        addPost,
        editPost,
        deletePost,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside PostsProvider");
  return ctx;
}
