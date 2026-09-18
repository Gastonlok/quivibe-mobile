import { useState } from "react";
import { Image } from "expo-image";
import { Linking, View } from "react-native";
import { useSession } from "../../store/session";
import {
  Button,
  Heading,
  RouteRow,
  Screen,
  Section,
} from "../../components/ui";
import { ErrorText } from "../../components/data";
import { SignInGate } from "../../components/SignInGate";
import { API_URL } from "../../services/api/client";
export default function Profile() {
  const session = useSession(),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false);
  return (
    <Screen>
      {session.user ? (
        <>
          <Image
            source={
              session.user.image
                ? { uri: session.user.image }
                : require("../../../assets/quivibe-logo.png")
            }
            accessibilityLabel="Photo de profil"
            style={{ width: 96, height: 96, borderRadius: 48 }}
            contentFit="cover"
          />
          <Heading title={session.user.name} description={session.user.email} />
        </>
      ) : (
        <>
          <Heading title="La ville est à toi." />
          <SignInGate />
        </>
      )}
      <Section title="Mon Quivibe">
        <View>
          <RouteRow
            icon="heart-outline"
            label="Mes favoris"
            href="/favorites"
          />
          <RouteRow
            icon="calendar-outline"
            label="Mes réservations"
            description="À venir, passées et annulées"
            href="/account/reservations"
          />
          <RouteRow
            icon="chatbubble-outline"
            label="Mes avis"
            href="/account/reviews"
          />
        </View>
      </Section>
      <Section title="Paramètres">
        <View>
          <RouteRow
            icon="person-outline"
            label="Modifier mon profil"
            href="/account/edit"
          />
          <RouteRow
            icon="notifications-outline"
            label="Notifications"
            href="/account/notifications"
          />
          <RouteRow
            icon="location-outline"
            label="Localisation et préférences"
            href="/account/settings"
          />
        </View>
        <Button
          label="Aide"
          secondary
          onPress={() => {
            void Linking.openURL(API_URL + "/contact").catch(() =>
              setError(new Error("Impossible d’ouvrir l’aide.")),
            );
          }}
        />
      </Section>
      {session.user && (
        <Button
          label={busy ? "Déconnexion…" : "Se déconnecter"}
          disabled={busy}
          secondary
          onPress={async () => {
            setBusy(true);
            try {
              await session.logout();
            } catch {
              setError(
                new Error(
                  "Déconnecté sur cet appareil. Le serveur n’a pas pu confirmer la révocation : reconnecte-toi pour réessayer.",
                ),
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
      <ErrorText error={error} />
    </Screen>
  );
}
