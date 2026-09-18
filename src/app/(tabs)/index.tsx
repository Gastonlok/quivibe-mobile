import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Heading, Screen, Section, ServiceState, s } from '../../components/ui';
import { discoveryCategories } from '../../constants/discovery';
import { colors as c } from '../../theme';
export default function Home() {
  return <Screen>
    <Heading eyebrow="LA VILLE T’ATTEND" title="Où veux-tu sortir aujourd’hui ?" description="Les bonnes adresses. Les belles rencontres. Ta prochaine vibe, à Kinshasa." />
    <Pressable accessibilityRole="button" accessibilityLabel="Rechercher un restaurant, café, bar ou événement" onPress={() => router.push('/search')} style={styles.search}>
      <Ionicons name="search" size={22} color={c.primaryText} /><Text style={[s.body, { flex: 1 }]}>Restaurant, café, bar, événement…</Text><View style={styles.searchArrow}><Ionicons name="arrow-forward" size={19} color={c.text} /></View>
    </Pressable>
    <View style={styles.hero}>
      <View style={styles.heroTop}><Text style={styles.heroLabel}>NE CHERCHE PLUS.</Text><Ionicons name="sparkles" size={25} color={c.text} /></View>
      <Text style={styles.heroTitle}>Vibe où{'\n'}tu veux.</Text>
      <Text style={styles.heroCopy}>Un dîner à deux ou une soirée entre amis ?{'\n'}Trouve l’envie qui te ressemble.</Text>
      <Button label="Explorer Kinshasa" onPress={() => router.push('/explore')} />
    </View>
    <Section title="À chaque envie, sa sortie">
      <View style={styles.categories}>{discoveryCategories.map(item => <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={`Explorer : ${item.label}`} onPress={() => router.push(item.label === 'Événements' ? '/events' : { pathname: '/explore', params: { category: item.label } })} style={({ pressed }) => [styles.category, pressed && s.pressed]}>
        <View style={styles.categoryIcon}><Ionicons name={item.icon} size={24} color={c.text} /></View><Text style={styles.categoryText}>{item.label}</Text>
      </Pressable>)}</View>
    </Section>
    <Section title="Tendances à Kinshasa" href="/explore"><ServiceState title="Les bonnes adresses arrivent" message="Le catalogue Quivibe n’est pas encore disponible dans cette version de l’application." icon="restaurant-outline" /></Section>
    <Section title="Près de toi"><View style={styles.nearby}><Ionicons name="navigate-outline" size={30} color={c.primaryText} /><Text style={s.body}>Découvre bientôt les adresses autour de toi. Tu choisiras quand partager ta position.</Text></View></Section>
    <Pressable accessibilityRole="button" accessibilityLabel="Découvrir Quivibe AI" onPress={() => router.push('/ai')} style={styles.ai}>
      <Ionicons name="sparkles" size={27} color={c.primary} /><View style={s.flex}><Text style={styles.aiTitle}>Une envie ? Parlons-en.</Text><Text style={styles.aiCopy}>Ton prochain coup de cœur avec Quivibe AI</Text></View><Ionicons name="arrow-forward" size={23} color={c.white} />
    </Pressable>
    <Section title="Ce week-end" href="/events"><ServiceState title="On se retrouve où ?" message="Les événements seront disponibles ici dès l’ouverture du service mobile." icon="calendar-outline" /></Section>
  </Screen>;
}
const styles = StyleSheet.create({
  search: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: c.border, borderWidth: 1, borderRadius: 20, backgroundColor: c.white, padding: 14 }, searchArrow: { backgroundColor: c.primary, padding: 10, borderRadius: 12 },
  hero: { backgroundColor: c.primary, borderRadius: 26, padding: 24, gap: 20 }, heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, heroLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, color: c.text },
  heroTitle: { fontSize: 54, lineHeight: 55, letterSpacing: -2.5, fontWeight: '900', color: c.text }, heroCopy: { color: c.text, lineHeight: 22, fontSize: 14 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, category: { width: '23%', flexGrow: 1, minWidth: 64, alignItems: 'center', gap: 10, paddingVertical: 8 }, categoryIcon: { padding: 17, borderRadius: 22, backgroundColor: c.white, borderColor: c.border, borderWidth: 1 }, categoryText: { fontSize: 11, color: c.text, fontWeight: '600', textAlign: 'center' },
  nearby: { backgroundColor: c.soft, padding: 22, borderRadius: 22, gap: 12 }, ai: { backgroundColor: c.secondary, padding: 22, borderRadius: 22, gap: 14, flexDirection: 'row', alignItems: 'center' }, aiTitle: { color: c.white, fontSize: 18, fontWeight: '800' }, aiCopy: { color: '#D0D0CA', fontSize: 12, lineHeight: 19, marginTop: 6 },
});
