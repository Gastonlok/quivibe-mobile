import { useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Linking, Text, View } from "react-native";
import { useSession } from "../../store/session";
import { usePreferences } from "../../store/preferences";
import { Button, Heading, Screen } from "../../components/ui";
import { SignInGate } from "../../components/SignInGate";
import { ErrorText } from "../../components/data";
import { ProfileEditor } from "../../components/account/ProfileEditor";
import { MyReservations } from "../../components/account/MyReservations";
import { Notifications } from "../../components/account/Notifications";
import { MyReviews } from "../../components/account/MyReviews";
import { typography as t } from "../../typography";
import { API_URL } from "../../services/api/client";
const titles: Record<string, string> = {
  reservations: "Mes réservations",
  reviews: "Mes avis",
  edit: "Modifier mon profil",
  settings: "Paramètres",
  notifications: "Notifications",
};
export default function AccountSection() {
  const { section = "", reference } = useLocalSearchParams<{
    section: string;
    reference?: string;
  }>();
  const session = useSession(),
    prefs = usePreferences(),
    [error, setError] = useState<unknown>(null);
  const title = titles[section] || "Mon espace";
  return (
    <Screen>
      <Stack.Screen options={{ title }} />
      <Heading title={title} />
      {section === "settings" ? (
        <View style={{ gap: 20 }}>
          <Text style={t.body}>
            Tu gardes le contrôle de ta position. Elle est utilisée pour la
            proximité, sans suivi en arrière-plan.
          </Text>
          <Button
            label="Utiliser ma position"
            onPress={() => {
              void prefs.locate();
            }}
          />
          <Text style={t.caption}>{prefs.locationError}</Text>
          <Button
            label="Réglages de l’appareil"
            secondary
            onPress={() => {
              void Linking.openSettings().catch(() =>
                setError(
                  new Error(
                    "Utilise les paramètres de ton navigateur ou de ton téléphone.",
                  ),
                ),
              );
            }}
          />
          <Button
            label="Choisir à nouveau mes vibes"
            secondary
            onPress={() => {
              void prefs.save({ completed: false }).catch(setError);
            }}
          />
          <Button
            label="Politique de confidentialité"
            secondary
            onPress={() => {
              void Linking.openURL(API_URL + "/privacy").catch(setError);
            }}
          />
          <ErrorText error={error} />
        </View>
      ) : !session.user ? (
        <SignInGate />
      ) : section === "edit" ? (
        <ProfileEditor />
      ) : section === "reviews" ? (
        <MyReviews />
      ) : section === "reservations" ? (
        <MyReservations reference={reference || undefined} />
      ) : section === "notifications" ? (
        <Notifications />
      ) : (
        <Text style={t.body}>Consulte tes réservations depuis cet espace.</Text>
      )}
    </Screen>
  );
}
