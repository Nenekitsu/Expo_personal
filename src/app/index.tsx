import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = ["All", "Hair sketch", "Character o...", "Anime pose..."];

// Each pin: id + height (this is what makes the "masonry" look).
// Swap the uri for your own images: require('./assets/pin1.jpg')
const img = (seed: string, w = 400, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

type PinData = { id: string; height: number; uri: string; dark?: boolean };

const LEFT: PinData[] = [
  { id: "l1", height: 230, uri: img("pin1", 400, 460) },
  { id: "l2", height: 190, uri: img("pin2", 400, 380) },
  { id: "l3", height: 120, uri: img("pin3", 400, 240) },
];

const RIGHT: PinData[] = [
  { id: "r1", height: 120, uri: img("pin4", 400, 240) },
  { id: "r2", height: 260, uri: img("pin5", 400, 520) },
  { id: "r3", height: 180, uri: img("pin6", 400, 360), dark: true },
];

function Pin({ pin }: { pin: PinData }) {
  return (
    <View style={styles.pinWrap}>
      <Image
        source={{ uri: pin.uri }}
        style={[styles.pinImage, { height: pin.height }]}
      />
      <TouchableOpacity style={styles.pinMenu}>
        <Ionicons name="ellipsis-horizontal" size={14} color="#111" />
      </TouchableOpacity>
    </View>
  );
}

function Column({ pins }: { pins: PinData[] }) {
  return (
    <View style={styles.column}>
      {pins.map((p) => (
        <Pin key={p.id} pin={p} />
      ))}
    </View>
  );
}

function TopTabs() {
  const [active, setActive] = React.useState(0);
  return (
    <View style={styles.tabsRow}>
      {TABS.map((t, i) => (
        <TouchableOpacity
          key={t}
          style={styles.tab}
          onPress={() => setActive(i)}
        >
          <Text style={[styles.tabText, i === active && styles.tabTextActive]}>
            {t}
          </Text>
          {i === active && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function BottomNav() {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity>
        <Ionicons name="home" size={26} color="#111" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="search" size={26} color="#111" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#111" />
        <View style={styles.redDot} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image
          source={{ uri: "https://picsum.photos/seed/avatar/100/100" }}
          style={styles.avatar}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />
      <TopTabs />

      {/* No scrolling: content is clipped at the bottom, like the screenshot */}
      <View style={styles.grid}>
        <Column pins={LEFT} />
        <Column pins={RIGHT} />
      </View>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Top tabs
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  tab: { marginRight: 16, alignItems: "center" },
  tabText: { fontSize: 14, color: "#555", paddingBottom: 6 },
  tabTextActive: { color: "#111", fontWeight: "700" },
  tabUnderline: {
    height: 3,
    alignSelf: "stretch",
    backgroundColor: "#111",
    borderRadius: 2,
  },

  // Grid
  grid: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingTop: 6,
    overflow: "hidden", // clips the pins that run past the bottom
  },
  column: { flex: 1, paddingHorizontal: 2 },
  pinWrap: { marginBottom: 4 },
  pinImage: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#e5e5e5",
  },
  pinMenu: {
    alignSelf: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // Bottom nav
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  redDot: {
    position: "absolute",
    top: 0,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e60023",
  },
  avatar: { width: 26, height: 26, borderRadius: 13 },
});
