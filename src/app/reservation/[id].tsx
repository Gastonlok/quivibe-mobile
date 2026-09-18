import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { ScrollView, Text, View } from "react-native";
import { useVenue } from "../../hooks/queries";
import { reservations } from "../../services/api/reservations";
import { useSession } from "../../store/session";
import {
  Button,
  Heading,
  Screen,
  Section,
  ServiceState,
} from "../../components/ui";
import { Chip, DataState, ErrorText, Field } from "../../components/data";
import { SignInGate } from "../../components/SignInGate";
import { kinshasaDay, dateLabel } from "../../utils/dates";
import { typography as t } from "../../typography";
export default function Booking() {
  const { id = "" } = useLocalSearchParams<{ id: string }>(),
    venue = useVenue(id),
    session = useSession(),
    cache = useQueryClient();
  const [date, setDate] = useState(kinshasaDay()),
    [partySize, setPartySize] = useState(2),
    [time, setTime] = useState(""),
    [phone, setPhone] = useState(""),
    [note, setNote] = useState(""),
    [key, setKey] = useState(() => Crypto.randomUUID());
  const slots = useQuery({
    queryKey: ["availability", venue.data?.id, date, partySize],
    enabled: Boolean(
      venue.data?.reservationsEnabled &&
      session.user &&
      /^\d{4}-\d{2}-\d{2}$/.test(date),
    ),
    queryFn: ({ signal }) =>
      reservations.availability(venue.data!.id, date, partySize, signal),
    staleTime: 0,
  });
  function change(update: () => void) {
    update();
    setKey(Crypto.randomUUID());
  }
  const mutation = useMutation({
    mutationFn: () => {
      if (!venue.data || !slots.data || !slots.data.slots.includes(time))
        throw new Error("Choisis un créneau disponible.");
      return reservations.create({
        requestKey: key,
        placeId: venue.data.id,
        date,
        time,
        partySize,
        phone: phone || undefined,
        specialRequest: note || undefined,
        expectedPriceMinor: slots.data.quote.amountMinor,
        expectedCurrency: slots.data.quote.currency,
      });
    },
    onSuccess: (result) => {
      void cache.invalidateQueries({ queryKey: ["reservations"] });
      void cache.invalidateQueries({ queryKey: ["availability"] });
      router.replace({
        pathname: "/confirmation/[reference]",
        params: { reference: result.reference },
      });
    },
    onError: () => {
      void slots.refetch();
    },
  });
  const disabled = mutation.isPending;
  return (
    <Screen>
      <Heading title="Réserver une table" description={venue.data?.name} />
      <DataState query={venue} />
      {!session.user ? (
        <SignInGate />
      ) : venue.data && !venue.data.reservationsEnabled ? (
        <ServiceState
          title="Réservation non proposée"
          message="Contacte directement cet établissement."
        />
      ) : (
        venue.data && (
          <>
            <Section title="Date">
              <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
                {Array.from({ length: 7 }, (_, i) => kinshasaDay(i)).map(
                  (day, i) => (
                    <Chip
                      key={day}
                      label={
                        i === 0
                          ? "Aujourd’hui"
                          : i === 1
                            ? "Demain"
                            : dateLabel(day + "T12:00:00Z")
                      }
                      selected={date === day}
                      disabled={disabled}
                      onPress={() =>
                        change(() => {
                          setDate(day);
                          setTime("");
                        })
                      }
                    />
                  ),
                )}
              </ScrollView>
              <Field
                label="Autre date (AAAA-MM-JJ)"
                value={date}
                editable={!disabled}
                onChangeText={(value) =>
                  change(() => {
                    setDate(value);
                    setTime("");
                  })
                }
              />
            </Section>
            <Section title="Nombre de personnes">
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <Button
                  label="−"
                  secondary
                  disabled={disabled || partySize <= 1}
                  onPress={() =>
                    change(() => {
                      setPartySize((n) => n - 1);
                      setTime("");
                    })
                  }
                />
                <Text style={t.label}>
                  {partySize} personne{partySize > 1 ? "s" : ""}
                </Text>
                <Button
                  label="+"
                  secondary
                  disabled={
                    disabled ||
                    partySize >= Math.min(30, venue.data!.maxPartySize)
                  }
                  onPress={() =>
                    change(() => {
                      setPartySize((n) => n + 1);
                      setTime("");
                    })
                  }
                />
              </View>
            </Section>
            <Section title="Heure · Kinshasa">
              <DataState
                query={slots}
                empty={slots.data?.slots.length === 0}
                title="Aucun créneau disponible"
                message="Essaie une autre date ou un autre nombre de personnes."
              />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {slots.data?.slots.map((slot) => (
                  <Chip
                    key={slot}
                    label={slot}
                    selected={time === slot}
                    disabled={disabled || slots.isFetching}
                    onPress={() => change(() => setTime(slot))}
                  />
                ))}
              </View>
            </Section>
            <Field
              label="Téléphone (facultatif, avec indicatif pays)"
              keyboardType="phone-pad"
              value={phone}
              editable={!disabled}
              onChangeText={(value) => change(() => setPhone(value))}
            />
            <Field
              label="Une demande particulière ? (facultatif)"
              multiline
              maxLength={500}
              value={note}
              editable={!disabled}
              onChangeText={(value) => change(() => setNote(value))}
            />
            {slots.data && (
              <Text style={t.body}>
                Prix de réservation :{" "}
                {slots.data.quote.amountMinor === 0
                  ? "sans frais de réservation"
                  : (slots.data.quote.amountMinor / 100).toFixed(2) +
                    " " +
                    slots.data.quote.currency}
                . Les consommations sont à régler auprès du lieu.
              </Text>
            )}
            <ErrorText error={mutation.error} />
            <Button
              label={
                disabled
                  ? "Envoi de ta réservation…"
                  : "Confirmer la réservation"
              }
              disabled={
                disabled ||
                !slots.data?.slots.includes(time) ||
                slots.isFetching ||
                slots.isError
              }
              onPress={() => mutation.mutate()}
            />
            <Text style={t.caption}>
              La disponibilité et le prix sont revérifiés au moment de la
              validation. En cas de coupure réseau, réessaie sans changer tes
              choix ou consulte tes réservations.
            </Text>
          </>
        )
      )}
    </Screen>
  );
}
