import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import * as Location from "expo-location";
type Position = { latitude: number; longitude: number };
type Preferences = { completed: boolean; vibes: string[]; recent: string[] };
const key = "quivibe:preferences:v1";
const initial: Preferences = { completed: false, vibes: [], recent: [] };
const Context = createContext<{
  ready: boolean;
  value: Preferences;
  position: Position | null;
  locationError: string;
  save: (next: Partial<Preferences>) => Promise<void>;
  locate: () => Promise<boolean>;
} | null>(null);
export function PreferencesProvider({ children }: PropsWithChildren) {
  const [value, setValue] = useState(initial),
    [ready, setReady] = useState(false);
  const [position, setPosition] = useState<Position | null>(null),
    [locationError, setLocationError] = useState("");
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (!raw) return;
        const data = JSON.parse(raw);
        if (
          active &&
          typeof data.completed === "boolean" &&
          Array.isArray(data.vibes) &&
          data.vibes.every((v: unknown) => typeof v === "string") &&
          Array.isArray(data.recent) &&
          data.recent.every((v: unknown) => typeof v === "string")
        )
          setValue(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  async function save(next: Partial<Preferences>) {
    const updated = { ...value, ...next };
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    setValue(updated);
  }
  async function locate() {
    setLocationError("");
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setLocationError(
          "Tu peux continuer à explorer Kinshasa sans localisation.",
        );
        return false;
      }
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const p = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error("Location timeout")),
            12000,
          );
        }),
      ]).finally(() => clearTimeout(timeout));
      setPosition({
        latitude: p.coords.latitude,
        longitude: p.coords.longitude,
      });
      return true;
    } catch {
      setLocationError("Position indisponible. Tu peux choisir un quartier.");
      return false;
    }
  }
  return (
    <Context.Provider
      value={{ value, ready, save, position, locate, locationError }}
    >
      {children}
    </Context.Provider>
  );
}
export function usePreferences() {
  const value = useContext(Context);
  if (!value) throw new Error("PreferencesProvider absent");
  return value;
}
