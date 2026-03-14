import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  NativeModules,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import HebrewDayPicker from "../components/HebrewDayPicker";
import HebrewMonthPicker from "../components/HebrewMonthPicker";
import YearsPicker from "../components/YearsPicker";
import { generateEvents } from "../core/scheduler";
import { buildIcs } from "../core/ics";

type IcsOpenModule = {
  openIcsChooser: (fileUri: string, chooserTitle?: string) => Promise<void>;
};

const { IcsOpenModule } = NativeModules as {
  IcsOpenModule?: IcsOpenModule;
};

export default function MainScreen() {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(1);
  const [monthKey, setMonthKey] = useState("tishrei");
  const [yearsAhead, setYearsAhead] = useState(10);
  const [busy, setBusy] = useState(false);

  const handleAddToCalendar = async () => {
    if (!title.trim()) {
      Alert.alert("שגיאה", "יש להזין שם לאירוע");
      return;
    }
    setBusy(true);
    try {
      const events = generateEvents(title.trim(), day, monthKey, yearsAhead);
      const icsContent = buildIcs(events);
      const file = new File(Paths.cache, "hebrew-dates.ics");
      file.create({ intermediates: true, overwrite: true });
      file.write(icsContent);
      const fileUri = file.uri;

      if (Platform.OS === "android") {
        try {
          if (!IcsOpenModule) {
            throw new Error("ICS opener is unavailable on this device.");
          }
          await IcsOpenModule.openIcsChooser(fileUri, "פתח באמצעות");
          return;
        } catch {
          if (!(await Sharing.isAvailableAsync())) {
            throw new Error("לא ניתן לפתוח או לשתף את קובץ ה-ICS במכשיר הזה");
          }
        }
      }

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("שיתוף קבצים אינו זמין במכשיר הזה");
      }

      await Sharing.shareAsync(fileUri, {
        dialogTitle: "פתח באמצעות",
        mimeType: "text/calendar",
        UTI: "com.apple.ical.ics",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "שגיאה לא ידועה";
      Alert.alert("שגיאה", message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>תאריכים עבריים</Text>
          <Text style={styles.headerSubtitle}>
            הוסף אירועים חוזרים לפי התאריך העברי
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>שם האירוע</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="שם האירוע"
              placeholderTextColor="#98b8d0"
              textAlign="right"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <HebrewMonthPicker value={monthKey} onChange={setMonthKey} />
            </View>
            <View style={styles.halfColumn}>
              <HebrewDayPicker value={day} onChange={setDay} />
            </View>
          </View>

          <YearsPicker value={yearsAhead} onChange={setYearsAhead} />

          <TouchableOpacity
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={handleAddToCalendar}
            disabled={busy}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {busy ? "מוסיף..." : "הוסף ליומן"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#e8f1f8",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a3d5c",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#5a7d9a",
    marginTop: 6,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#1a3d5c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a3d5c",
    textAlign: "right",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#b0cfe0",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: "#1a3d5c",
  },
  row: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  halfColumn: {
    flex: 1,
  },
  button: {
    backgroundColor: "#3b8fd4",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#98b8d0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});
