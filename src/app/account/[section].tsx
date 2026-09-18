import { Stack, useLocalSearchParams } from 'expo-router';
import { Heading, Screen, ServiceState } from '../../components/ui';
const titles: Record<string, string> = { reservations: 'Mes réservations', reviews: 'Mes avis', edit: 'Modifier mon profil', settings: 'Paramètres' };
export default function AccountSection() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const title = titles[section] || 'Mon espace';
  return <Screen><Stack.Screen options={{ title }} /><Heading eyebrow="MON ESPACE" title={title} /><ServiceState message="Cet espace sera disponible avec la connexion à ton compte Quivibe." icon="person-outline" /></Screen>;
}
