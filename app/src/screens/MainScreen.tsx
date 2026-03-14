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
import { buildIcs } from "../core/ics";
import { generateEvents } from "../core/scheduler";

type IcsOpenModule = {
  openIcsChooser: (fileUri: string, chooserTitle?: string) => Promise<void>;
};

type DraftEvent = {
  id: number;
  title: string;
  day: number;
  monthKey: string;
};

const { IcsOpenModule } = NativeModules as {
  IcsOpenModule?: IcsOpenModule;
};

function createDraftEvent(id: number): DraftEvent {
  return {
    id,
    title: "",
    day: 1,
    monthKey: "tishrei",
  };
}

export default function MainScreen() {
  const [drafts, setDrafts] = useState<DraftEvent[]>([createDraftEvent(1)]);
  const [nextId, setNextId] = useState(2);
  const [yearsAhead, setYearsAhead] = useState(10);
  const [busy, setBusy] = useState(false);

  const updateDraft = (id: number, patch: Partial<DraftEvent>) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === id ? { ...draft, ...patch } : draft,
      ),
    );
  };

  const addDraft = () => {
    setDrafts((current) => [...current, createDraftEvent(nextId)]);
    setNextId((current) => current + 1);
  };

  const removeDraft = (id: number) => {
    setDrafts((current) =>
      current.length === 1
        ? current
        : current.filter((draft) => draft.id !== id),
    );
  };

  const handleAddToCalendar = async () => {
    const activeDrafts = drafts.filter((draft) => draft.title.trim());

    if (!activeDrafts.length) {
      Alert.alert("שגיאה", "יש להזין לפחות אירוע אחד");
      return;
    }

    setBusy(true);

    try {
      const events = activeDrafts
        .flatMap((draft) =>
          generateEvents(
            draft.title.trim(),
            draft.day,
            draft.monthKey,
            yearsAhead,
          ),
        )
        .sort(
          (left, right) =>
            left.startDate.getTime() - right.startDate.getTime() ||
            left.summary.localeCompare(right.summary, "he"),
        );

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
            הוסף כמה אירועים חוזרים לפי התאריך העברי
          </Text>
        </View>

        <View style={styles.card}>
          {drafts.map((draft, index) => (
            <View
              key={draft.id}
              style={[
                styles.eventSection,
                index > 0 && styles.eventSectionWithDivider,
              ]}
            >
              {drafts.length > 1 ? (
                <View style={styles.eventHeader}>
                  <TouchableOpacity
                    onPress={() => removeDraft(draft.id)}
                    style={styles.removeButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.removeButtonText}>הסר</Text>
                  </TouchableOpacity>
                  <Text style={styles.eventHeaderText}>אירוע {index + 1}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>שם האירוע</Text>
                <TextInput
                  style={styles.textInput}
                  value={draft.title}
                  onChangeText={(title) => updateDraft(draft.id, { title })}
                  placeholder="שם האירוע"
                  placeholderTextColor="#98b8d0"
                  textAlign="right"
                />
              </View>

              <View style={styles.row}>
                <View style={styles.halfColumn}>
                  <HebrewMonthPicker
                    value={draft.monthKey}
                    onChange={(monthKey) =>
                      updateDraft(draft.id, { monthKey })
                    }
                  />
                </View>
                <View style={styles.halfColumn}>
                  <HebrewDayPicker
                    value={draft.day}
                    onChange={(day) => updateDraft(draft.id, { day })}
                  />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addEventButton}
            onPress={addDraft}
            activeOpacity={0.85}
          >
            <View style={styles.addEventCircle}>
              <Text style={styles.addEventPlus}>+</Text>
            </View>
            <Text style={styles.addEventText}>הוסף אירוע נוסף</Text>
          </TouchableOpacity>

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
  eventSection: {
    width: "100%",
  },
  eventSectionWithDivider: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#e5eff6",
  },
  eventHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  eventHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5a7d9a",
  },
  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#eef5fb",
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4e88b8",
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
  addEventButton: {
    alignSelf: "center",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  addEventCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#42c7c1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1b8f99",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  addEventPlus: {
    fontSize: 26,
    lineHeight: 28,
    fontWeight: "700",
    color: "#fff",
    marginTop: -1,
  },
  addEventText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#3f8394",
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
