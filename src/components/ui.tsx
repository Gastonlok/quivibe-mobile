import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { IconName } from '../constants/discovery';
import { colors as c } from '../theme';

export function Screen({ children }: PropsWithChildren) {
  return <SafeAreaView edges={['left', 'right', 'bottom']} style={s.screen}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>{children}</ScrollView></SafeAreaView>;
}
export function Heading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <View style={s.heading}>{eyebrow && <Text style={s.eyebrow}>{eyebrow}</Text>}<Text accessibilityRole="header" style={s.title}>{title}</Text>{description && <Text style={s.body}>{description}</Text>}</View>;
}
export function Button({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.button, secondary && s.secondaryButton, pressed && s.pressed]}><Text style={[s.buttonText, secondary && { color: c.text }]}>{label}</Text></Pressable>;
}
export function RouteRow({ label, description, icon, href }: { label: string; description?: string; icon: IconName; href: Href }) {
  return <Pressable accessibilityRole="button" onPress={() => router.push(href)} style={({ pressed }) => [s.row, pressed && s.pressed]}><View style={s.icon}><Ionicons name={icon} size={23} color={c.primaryText} /></View><View style={s.flex}><Text style={s.rowTitle}>{label}</Text>{description && <Text style={s.caption}>{description}</Text>}</View><Ionicons name="chevron-forward" size={19} color={c.muted} /></Pressable>;
}
export function ServiceState({ title = 'Bientôt dans ton app', message = 'Ce service n’est pas encore disponible dans l’application.', icon = 'time-outline' }: { title?: string; message?: string; icon?: IconName }) {
  return <View style={s.state}><View style={s.stateIcon}><Ionicons name={icon} color={c.primaryText} size={28} /></View><Text accessibilityRole="header" style={s.stateTitle}>{title}</Text><Text style={[s.body, s.center]}>{message}</Text></View>;
}
export function Section({ title, children, href }: PropsWithChildren<{ title: string; href?: Href }>) {
  return <View style={s.section}><View style={s.sectionHeader}><Text accessibilityRole="header" style={s.sectionTitle}>{title}</Text>{href && <Pressable accessibilityRole="button" accessibilityLabel={`Tout voir : ${title}`} onPress={() => router.push(href)} style={s.more}><Ionicons name="arrow-forward" size={22} color={c.text} /></Pressable>}</View>{children}</View>;
}
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background }, content: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 24, paddingBottom: 32, gap: 24 },
  heading: { gap: 10 }, eyebrow: { color: c.primaryText, fontSize: 11, fontWeight: '800', letterSpacing: 2 }, title: { fontSize: 34, lineHeight: 41, fontWeight: '800', color: c.text, letterSpacing: -1.2 },
  body: { fontSize: 15, lineHeight: 23, color: c.muted }, caption: { color: c.muted, fontSize: 13, lineHeight: 20 },
  button: { minHeight: 52, borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: c.secondary }, secondaryButton: { backgroundColor: c.white, borderWidth: 1, borderColor: c.border }, buttonText: { color: c.white, fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.65 }, row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 76, paddingVertical: 12, borderBottomColor: c.border, borderBottomWidth: 1 }, rowTitle: { fontWeight: '700', fontSize: 16, color: c.text }, flex: { flex: 1 }, icon: { backgroundColor: c.soft, padding: 12, borderRadius: 16 },
  state: { borderRadius: 22, borderWidth: 1, borderColor: c.border, backgroundColor: c.white, padding: 24, alignItems: 'center', gap: 12 }, stateIcon: { backgroundColor: c.soft, padding: 16, borderRadius: 24 }, stateTitle: { color: c.text, fontWeight: '700', fontSize: 18, textAlign: 'center' }, center: { textAlign: 'center' },
  section: { gap: 12 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, sectionTitle: { fontSize: 21, fontWeight: '800', color: c.text, letterSpacing: -0.5, flex: 1 }, more: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
});
