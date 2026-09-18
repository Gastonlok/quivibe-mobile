import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button, ServiceState } from "./ui";
import { colors as c } from "../theme";
import { fonts, typography as t } from "../typography";
export function Chip({
  label,
  selected,
  onPress,
  disabled = false,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const [scale] = useState(() => new Animated.Value(1));
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduce,
    );
    return () => sub.remove();
  }, []);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: Boolean(selected), disabled }}
        disabled={disabled}
        onPress={() => {
          if (!reduce)
            Animated.sequence([
              Animated.timing(scale, {
                toValue: 0.95,
                duration: 70,
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start();
          onPress();
        }}
        style={[
          styles.chip,
          selected && styles.active,
          disabled && { opacity: 0.4 },
        ]}
      >
        <Text style={[styles.chipText, selected && { color: c.primaryText }]}>
          {label}
        </Text>
        {selected && (
          <Ionicons name="checkmark" size={16} color={c.primaryText} />
        )}
      </Pressable>
    </Animated.View>
  );
}
export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        {...props}
        style={[
          styles.input,
          props.multiline && { minHeight: 110, textAlignVertical: "top" },
          props.style,
        ]}
      />
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
export function Skeleton() {
  return (
    <View
      accessibilityLabel="Chargement"
      accessibilityRole="progressbar"
      style={styles.skeleton}
    >
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: "45%" }]} />
      <ActivityIndicator color={c.primaryText} />
    </View>
  );
}
type QueryState = {
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => unknown;
};
export function DataState({
  query,
  empty,
  title = "Aucun endroit trouvé.",
  message = "Essaie une autre recherche ou modifie tes filtres.",
}: {
  query: QueryState;
  empty?: boolean;
  title?: string;
  message?: string;
}) {
  if (query.isPending) return <Skeleton />;
  if (query.isError)
    return (
      <View style={{ gap: 12 }}>
        <ServiceState
          title="Une petite interruption"
          message={query.error?.message || "Vérifie ta connexion et réessaie."}
          icon="cloud-offline-outline"
        />
        <Button
          label="Réessayer"
          onPress={() => {
            void query.refetch();
          }}
        />
      </View>
    );
  if (empty)
    return (
      <ServiceState title={title} message={message} icon="search-outline" />
    );
  return null;
}
export function ErrorText({ error }: { error: unknown }) {
  return error ? (
    <Text accessibilityRole="alert" style={styles.error}>
      {error instanceof Error ? error.message : String(error)}
    </Text>
  ) : null;
}
export function More({
  hasNext,
  loading,
  onPress,
}: {
  hasNext?: boolean;
  loading: boolean;
  onPress: () => void;
}) {
  return hasNext ? (
    <Button
      label={loading ? "Chargement…" : "Voir la suite"}
      disabled={loading}
      secondary
      onPress={onPress}
    />
  ) : null;
}
export const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderColor: c.border,
    borderWidth: 1,
    backgroundColor: c.white,
  },
  active: { borderColor: c.primary, backgroundColor: c.soft },
  chipText: { ...t.caption, color: c.text },
  input: {
    ...t.body,
    color: c.text,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 14,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: c.white,
  },
  label: { fontFamily: fonts.bold, fontSize: 14, color: c.text },
  error: { ...t.caption, color: c.error },
  skeleton: {
    backgroundColor: c.white,
    borderRadius: 22,
    padding: 12,
    gap: 14,
  },
  skeletonImage: { height: 160, borderRadius: 16, backgroundColor: c.border },
  skeletonLine: {
    height: 14,
    width: "70%",
    backgroundColor: c.border,
    borderRadius: 7,
  },
});
