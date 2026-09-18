import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { IconName } from '../../constants/discovery';
import { colors as c } from '../../theme';
const tabs: { name: string; title: string; icon: IconName; active: IconName }[] = [
  { name: 'index', title: 'Accueil', icon: 'home-outline', active: 'home' },
  { name: 'explore', title: 'Explorer', icon: 'compass-outline', active: 'compass' },
  { name: 'events', title: 'Événements', icon: 'calendar-outline', active: 'calendar' },
  { name: 'favorites', title: 'Favoris', icon: 'heart-outline', active: 'heart' },
  { name: 'profile', title: 'Profil', icon: 'person-outline', active: 'person' },
];
function Brand() {
  return <View style={styles.brand}><Text accessibilityRole="header" style={styles.wordmark}>Quivibe<Text style={{ color: c.primary }}>.</Text></Text><View style={styles.city}><Ionicons name="location-sharp" color={c.primaryText} size={12} /><Text style={styles.cityText}>KINSHASA</Text></View></View>;
}
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerTitle: () => <Brand />, headerTitleAlign: 'left', headerStyle: { backgroundColor: c.background }, headerShadowVisible: false, tabBarActiveTintColor: c.primaryText, tabBarInactiveTintColor: c.muted, tabBarStyle: { height: 60 + bottom, paddingTop: 6, paddingBottom: bottom, backgroundColor: c.white, borderTopColor: c.border }, tabBarLabelStyle: { fontSize: 10, fontWeight: '700' } }}>
    {tabs.map(tab => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title, tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? tab.active : tab.icon} color={color} size={size} /> }} />)}
  </Tabs>;
}
const styles = StyleSheet.create({ brand: { flexDirection: 'row', alignItems: 'center', gap: 16 }, wordmark: { fontSize: 27, color: c.text, letterSpacing: -1.4, fontWeight: '900' }, city: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.soft, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 }, cityText: { fontSize: 9, letterSpacing: 1.2, fontWeight: '800', color: c.primaryText } });
