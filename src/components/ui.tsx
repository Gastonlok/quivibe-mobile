import Ionicons from "@expo/vector-icons/Ionicons";
import { router, type Href } from "expo-router";
import type { PropsWithChildren } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { IconName } from "../constants/discovery";
import { colors as c } from "../theme";
import { fonts, typography as t } from "../typography";

export function Screen({
  children,
  refreshing = false,
  onRefresh,
}: PropsWithChildren<{ refreshing?: boolean; onRefresh?: () => void }>) {
  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={s.screen}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.content}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <View style={s.heading}>
      {eyebrow && <Text style={s.eyebrow}>{eyebrow}</Text>}
      <Text accessibilityRole="header" style={s.title}>
        {title}
      </Text>
      {description && <Text style={s.body}>{description}</Text>}
    </View>
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        disabled && { opacity: 0.5 },
        s.button,
        secondary && s.secondaryButton,
        pressed && s.pressed,
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: c.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function RouteRow({
  label,
  description,
  icon,
  href,
}: {
  label: string;
  description?: string;
  icon: IconName;
  href: Href;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(href)}
      style={({ pressed }) => [s.row, pressed && s.pressed]}
    >
      <View style={s.icon}>
        <Ionicons name={icon} size={23} color={c.primaryText} />
      </View>
      <View style={s.flex}>
        <Text style={s.rowTitle}>{label}</Text>
        {description && <Text style={s.caption}>{description}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={19} color={c.muted} />
    </Pressable>
  );
}
export function ServiceState({
  title = "Bientôt dans ton app",
  message = "Ce service n’est pas encore disponible dans l’application.",
  icon = "time-outline",
}: {
  title?: string;
  message?: string;
  icon?: IconName;
}) {
  return (
    <View style={s.state}>
      <View style={s.stateIcon}>
        <Ionicons name={icon} color={c.primaryText} size={28} />
      </View>
      <Text accessibilityRole="header" style={s.stateTitle}>
        {title}
      </Text>
      <Text style={[s.body, s.center]}>{message}</Text>
    </View>
  );
}
export function Section({
  title,
  children,
  href,
}: PropsWithChildren<{ title: string; href?: Href }>) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text accessibilityRole="header" style={s.sectionTitle}>
          {title}
        </Text>
        {href && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Tout voir : ${title}`}
            onPress={() => router.push(href)}
            style={s.more}
          >
            <Ionicons name="arrow-forward" size={22} color={c.text} />
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 32,
    gap: 24,
  },
  heading: { gap: 10 },
  eyebrow: { color: c.primaryText, ...t.eyebrow },
  title: { ...t.title, color: c.text },
  body: { ...t.body, color: c.muted },
  caption: { color: c.muted, ...t.caption },
  button: {
    minHeight: 52,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.primary,
  },
  secondaryButton: {
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.border,
  },
  buttonText: { color: c.text, ...t.label },
  pressed: { opacity: 0.65 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 76,
    paddingVertical: 12,
    borderBottomColor: c.border,
    borderBottomWidth: 1,
  },
  rowTitle: { ...t.label, fontSize: 16, color: c.text },
  flex: { flex: 1 },
  icon: { backgroundColor: c.soft, padding: 12, borderRadius: 16 },
  state: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.white,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  stateIcon: { backgroundColor: c.soft, padding: 16, borderRadius: 24 },
  stateTitle: {
    color: c.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
  },
  center: { textAlign: "center" },
  section: { gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitle: { ...t.section, color: c.text, flex: 1 },
  more: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
