import { router } from 'expo-router';
import { Button, Heading, Screen, ServiceState } from '../../components/ui';
export default function Register() {
  return <Screen><Heading eyebrow="REJOINS LA VIBE" title="Tes sorties commencent ici." /><ServiceState title="Inscription mobile bientôt disponible" message="Si tu as déjà un compte sur le site Quivibe, tu pourras utiliser ce même compte dans l’application." icon="person-add-outline" /><Button label="J’ai déjà un compte" secondary onPress={() => router.replace('/auth/login')} /></Screen>;
}
