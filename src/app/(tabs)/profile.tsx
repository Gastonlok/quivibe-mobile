import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Heading, RouteRow, Screen } from '../../components/ui';
export default function Profile() {
  return <Screen><Image source={require('../../../assets/quivibe-logo.png')} accessibilityLabel="Logo officiel Quivibe" style={{ width: 104, height: 104, borderRadius: 24 }} contentFit="contain" /><Heading eyebrow="TON ESPACE QUIVIBE" title="La ville est à toi." description="Un seul compte pour tes adresses préférées, tes sorties et tes réservations." /><Button label="Se connecter" onPress={() => router.push('/auth/login')} /><Button label="Créer un compte" secondary onPress={() => router.push('/auth/register')} /><View>
    <RouteRow icon="calendar-outline" label="Mes réservations" description="À venir, passées et annulées" href="/account/reservations" />
    <RouteRow icon="heart-outline" label="Mes favoris" href="/favorites" />
    <RouteRow icon="chatbubble-outline" label="Mes avis" href="/account/reviews" />
    <RouteRow icon="person-outline" label="Modifier mon profil" href="/account/edit" />
    <RouteRow icon="settings-outline" label="Paramètres" href="/account/settings" />
  </View></Screen>;
}
