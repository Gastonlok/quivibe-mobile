import { router, useLocalSearchParams } from 'expo-router';
import { Button, Heading, Screen, ServiceState } from '../../components/ui';
export default function Explore() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  return <Screen><Heading eyebrow="DÉCOUVRIR KINSHASA" title={category || 'À chacun sa vibe.'} description="Du café du matin aux soirées qui se prolongent. Explore la ville à ton rythme." /><Button label="Rechercher une adresse" onPress={() => router.push('/search')} /><ServiceState title="Le catalogue arrive bientôt" message="Les adresses et les filtres seront disponibles dès l’ouverture du catalogue mobile." icon="compass-outline" />{category && <Button label="Toutes les catégories" secondary onPress={() => router.setParams({ category: '' })} />}</Screen>;
}
