import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { HEBREW_MONTHS } from "../core/hebrewDate";

interface Props {
  value: string;
  onChange: (monthKey: string) => void;
}

export default function HebrewMonthPicker({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);

  const selectedLabel =
    HEBREW_MONTHS.find((m) => m.key === value)?.hebrew ?? "";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>חודש</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`חודש ${selectedLabel}`}
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
            <Text style={styles.modalTitle}>בחר חודש</Text>
            <FlatList
              data={HEBREW_MONTHS}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => {
                const selected = item.key === value;
                return (
                  <TouchableOpacity
                    style={[styles.item, selected && styles.itemSelected]}
                    onPress={() => {
                      onChange(item.key);
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
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eef4f9",
    borderRadius: 8,
  },
  itemSelected: {
    backgroundColor: "#3b8fd4",
  },
  itemText: {
    fontSize: 18,
    color: "#1a3d5c",
    textAlign: "right",
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
