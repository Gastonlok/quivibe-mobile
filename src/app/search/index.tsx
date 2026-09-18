import { Heading, Screen, ServiceState } from '../../components/ui';
export default function Search() {
  return <Screen><Heading eyebrow="TA PROCHAINE SORTIE" title="Une adresse en tête ?" description="Restaurants, cafés, bars, lounges et événements à Kinshasa." /><ServiceState title="La recherche arrive bientôt" message="Tu pourras rechercher les adresses Quivibe et affiner tes envies ici." icon="search-outline" /></Screen>;
}
