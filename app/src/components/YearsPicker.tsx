import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const YEAR_OPTIONS = [1, 5, 10, 20];

interface Props {
  value: number;
  onChange: (years: number) => void;
}

export default function YearsPicker({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>שנים קדימה</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`${value} שנים קדימה`}
      >
        <Text style={styles.selectorText}>{value}</Text>
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
            <Text style={styles.modalTitle}>שנים קדימה</Text>
            <FlatList
              data={YEAR_OPTIONS}
              keyExtractor={(item) => String(item)}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <TouchableOpacity
                    style={[styles.item, selected && styles.itemSelected]}
                    onPress={() => {
                      onChange(item);
                      setVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        selected && styles.itemTextSelected,
                      ]}
                    >
                      {item}
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
    width: "75%",
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
    textAlign: "center",
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
