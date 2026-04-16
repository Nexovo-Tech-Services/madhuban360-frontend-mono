import { Ionicons } from "@expo/vector-icons";
import { font } from "@madhuban/theme";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ImagePreviewModal({
  visible,
  imageUri,
  title,
  subtitle,
  onClose,
}: {
  visible: boolean;
  imageUri: string | null;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.shell, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
            centerContent
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="image-outline" size={28} color="rgba(255,255,255,0.7)" />
                <Text style={styles.emptyText}>Image unavailable</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.92)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  shell: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: "#FFFFFF",
    fontFamily: font.family.black,
    fontSize: 18,
  },
  subtitle: {
    color: "rgba(226,232,240,0.82)",
    fontFamily: font.family.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.56)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  image: {
    width: "100%",
    height: "100%",
    minHeight: 320,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 240,
  },
  emptyText: {
    color: "rgba(255,255,255,0.78)",
    fontFamily: font.family.medium,
    fontSize: 13,
  },
});
