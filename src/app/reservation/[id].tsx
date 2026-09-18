import { Heading, Screen, ServiceState } from '../../components/ui';
export default function Detail() {
  return <Screen><Heading title="Une table t’attend" /><ServiceState message="La réservation mobile n’est pas encore disponible. Aucune réservation n’a été créée." icon="calendar-outline" /></Screen>;
}
