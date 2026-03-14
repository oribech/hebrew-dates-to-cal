import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GEMATRIA_DAYS } from "../core/hebrewDate";

interface Props {
  value: number;
  onChange: (day: number) => void;
}

export default function HebrewDayPicker({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);

  const selectedLabel =
    GEMATRIA_DAYS.find((d) => d.value === value)?.hebrew ?? "";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>יום</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`יום ${selectedLabel}`}
      >
        <Text style={styles.selectorText}>{selectedLabel}</Text>
        <Text style={styles.chevron}>&#x25BC;</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>בחר יום</Text>
            <FlatList
              data={GEMATRIA_DAYS}
              keyExtractor={(item) => String(item.value)}
              numColumns={5}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const selected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[styles.item, selected && styles.itemSelected]}
                    onPress={() => {
                      onChange(item.value);
                      setVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selected && styles.itemTextSelected,
                      ]}
                    >
                      {item.hebrew}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a3d5c",
    textAlign: "right",
    marginBottom: 6,
  },
  selector: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#b0cfe0",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectorText: {
    flex: 1,
    fontSize: 18,
    color: "#1a3d5c",
    textAlign: "right",
  },
  chevron: {
    fontSize: 12,
    color: "#5a9fd4",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a3d5c",
    textAlign: "center",
    marginBottom: 16,
  },
  listContent: {
    alignItems: "center",
  },
  item: {
    width: 52,
    height: 44,
    margin: 4,
    borderRadius: 8,
    backgroundColor: "#f0f7fc",
    justifyContent: "center",
    alignItems: "center",
  },
  itemSelected: {
    backgroundColor: "#3b8fd4",
  },
  itemText: {
    fontSize: 18,
    color: "#1a3d5c",
  },
  itemTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  closeButton: {
    marginTop: 16,
    alignSelf: "center",
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#e8f1f8",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#3b8fd4",
    fontWeight: "600",
  },
});
