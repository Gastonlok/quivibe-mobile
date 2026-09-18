import { router } from 'expo-router';
import { Button, Heading, Screen, ServiceState } from '../../components/ui';
export default function Favorites() {
  return <Screen><Heading eyebrow="TES COUPS DE CŒUR" title="Les adresses à garder." description="Retrouve bientôt tes favoris Quivibe, ici aussi." /><ServiceState title="Tes favoris, bientôt avec toi" message="La connexion à ton compte Quivibe sera nécessaire pour retrouver et sauvegarder tes adresses." icon="heart-outline" /><Button label="Découvrir mon espace" onPress={() => router.push('/profile')} /></Screen>;
}
