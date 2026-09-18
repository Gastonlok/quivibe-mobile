import { router } from 'expo-router';
import { Button, Heading, Screen, ServiceState } from '../../components/ui';
export default function Login() {
  return <Screen><Heading eyebrow="HEUREUX DE TE RETROUVER" title="Bienvenue chez toi." description="Ton compte Quivibe t’accompagnera du web au mobile." /><ServiceState title="Connexion mobile bientôt disponible" message="L’accès à ton compte n’est pas encore activé dans cette version." icon="lock-closed-outline" /><Button label="Je n’ai pas encore de compte" secondary onPress={() => router.replace('/auth/register')} /></Screen>;
}
