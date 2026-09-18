import { router, Stack } from "expo-router";
import { Button, Screen, ServiceState } from "../components/ui";
export default function NotFound() {
  return (
    <Screen>
      <Stack.Screen options={{ title: "Page introuvable" }} />
      <ServiceState
        title="Cette adresse nous échappe"
        message="Ce lien ne mène à aucune page de l’application."
        icon="compass-outline"
      />
      <Button label="Revenir à l’accueil" onPress={() => router.replace("/")} />
    </Screen>
  );
}
