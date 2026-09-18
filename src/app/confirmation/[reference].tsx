import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { AccessibilityInfo, Animated, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { reservations } from "../../services/api/reservations";
import { useSession } from "../../store/session";
import { Button, Heading, Screen } from "../../components/ui";
import { DataState } from "../../components/data";
import { SignInGate } from "../../components/SignInGate";
import { dateLabel, timeLabel, statusLabel } from "../../utils/dates";
import { typography as t } from "../../typography";
import { colors as c } from "../../theme";
export default function Confirmation() {
  const { reference = "" } = useLocalSearchParams<{ reference: string }>(),
    { user } = useSession();
  const query = useQuery({
    queryKey: ["reservations", reference, user?.id],
    enabled: Boolean(user),
    queryFn: ({ signal }) => reservations.detail(reference, signal),
  });
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (active)
        Animated.timing(opacity, {
          toValue: 1,
          duration: reduce ? 0 : 300,
          useNativeDriver: true,
        }).start();
    });
    return () => {
      active = false;
    };
  }, [opacity]);
  if (!user)
    return (
      <Screen>
        <SignInGate />
      </Screen>
    );
  const item = query.data;
  return (
    <Screen>
      <DataState query={query} />
      {item && (
        <>
          <Animated.View style={{ opacity, alignItems: "center" }}>
            <Ionicons
              name={
                item.status === "CONFIRMED"
                  ? "checkmark-circle"
                  : "time-outline"
              }
              size={80}
              color={c.primaryText}
            />
          </Animated.View>
          <Heading
            title={
              item.status === "CONFIRMED"
                ? "Réservation confirmée 🎉"
                : statusLabel[item.status] || item.status
            }
            description={
              item.status === "PENDING"
                ? "Ta demande est enregistrée. Le lieu doit encore la confirmer."
                : "Retrouve les informations de ta réservation."
            }
          />
          <Text style={t.section}>{item.place.name}</Text>
          <Text style={t.body}>
            {dateLabel(item.dateTime)} · {timeLabel(item.dateTime)} (Kinshasa)
            {"\n"}
            {item.partySize} personnes{"\n"}
            {item.place.address}
          </Text>
          <Text style={t.caption}>Référence : {item.reference}</Text>
          <Button
            label="Voir ma réservation"
            onPress={() =>
              router.replace({
                pathname: "/account/[section]",
                params: { section: "reservations", reference: item.reference },
              })
            }
          />
          <Button
            label="Retour à l’accueil"
            secondary
            onPress={() => router.replace("/")}
          />
        </>
      )}
    </Screen>
  );
}
