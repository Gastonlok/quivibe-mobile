import { Heading, Screen, ServiceState } from '../../components/ui';
export default function Detail() {
  return <Screen><Heading title="À la carte" /><ServiceState message="Le menu de ce lieu n’est pas encore accessible dans l’application." icon="restaurant-outline" /></Screen>;
}
