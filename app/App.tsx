import { I18nManager } from "react-native";
import { StatusBar } from "expo-status-bar";
import MainScreen from "./src/screens/MainScreen";

// Undo any previously persisted RTL state — we handle RTL explicitly via styles
if (I18nManager.isRTL) {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <MainScreen />
    </>
  );
}
