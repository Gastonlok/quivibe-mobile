import { useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { reservations } from "../../services/api/reservations";
import { useSession } from "../../store/session";
import { Button } from "../ui";
import { Chip, DataState, ErrorText, More } from "../data";
import { dateLabel, timeLabel, statusLabel } from "../../utils/dates";
import { typography as t } from "../../typography";
import type { Reservation } from "../../types/api";
function BookingCard({ item }: { item: Reservation }) {
  const [now] = useState(() => Date.now());
  const cache = useQueryClient(),
    [confirm, setConfirm] = useState(false);
  const mutation = useMutation({
    mutationFn: () => reservations.cancel(item.id),
    onSuccess: () => {
      setConfirm(false);
      void cache.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
  return (
    <View style={{ gap: 12, paddingVertical: 16 }}>
      <Text style={t.section}>{item.place.name}</Text>
      <Text style={t.body}>
        {dateLabel(item.dateTime)} · {timeLabel(item.dateTime)} ·{" "}
        {item.partySize} personnes
      </Text>
      <Text style={t.label}>{statusLabel[item.status] || item.status}</Text>
      <Text style={t.caption}>
        {item.place.address}
        {"\n"}Réf. {item.reference}
      </Text>
      {["PENDING", "CONFIRMED"].includes(item.status) &&
        new Date(item.dateTime).getTime() > now &&
        (confirm ? (
          <>
            <Text style={t.body}>Annuler cette réservation ?</Text>
            <Button
              label={mutation.isPending ? "Annulation…" : "Oui, annuler"}
              disabled={mutation.isPending}
              onPress={() => mutation.mutate()}
            />
            <Button
              label="Garder ma réservation"
              secondary
              disabled={mutation.isPending}
              onPress={() => setConfirm(false)}
            />
          </>
        ) : (
          <Button
            label="Annuler ma réservation"
            secondary
            onPress={() => setConfirm(true)}
          />
        ))}
      <ErrorText error={mutation.error} />
    </View>
  );
}
export function MyReservations({ reference }: { reference?: string }) {
  const { user } = useSession(),
    [group, setGroup] = useState("upcoming");
  const query = useInfiniteQuery({
    queryKey: ["reservations", user?.id, group],
    enabled: !reference,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      reservations.list(pageParam, signal, group),
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });
  const detail = useQuery({
    queryKey: ["reservations", reference, user?.id],
    enabled: Boolean(reference),
    queryFn: ({ signal }) => reservations.detail(reference!, signal),
  });
  if (reference)
    return (
      <>
        <DataState query={detail} />
        {detail.data && <BookingCard item={detail.data} />}
        <Button
          label="Toutes mes réservations"
          secondary
          onPress={() => router.setParams({ reference: "" })}
        />
      </>
    );
  const items = query.data?.pages.flatMap((p) => p.items) || [];
  return (
    <>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {[
          ["upcoming", "À venir"],
          ["past", "Passées"],
          ["cancelled", "Annulées"],
        ].map(([value, label]) => (
          <Chip
            key={value}
            label={label}
            selected={group === value}
            onPress={() => setGroup(value)}
          />
        ))}
      </View>
      <DataState
        query={query}
        empty={!items.length}
        title="Aucune réservation ici"
        message="Ta prochaine sortie commence dans Explorer."
      />
      {items.map((item) => (
        <BookingCard key={item.id} item={item} />
      ))}
      <More
        hasNext={query.hasNextPage}
        loading={query.isFetchingNextPage}
        onPress={() => {
          void query.fetchNextPage();
        }}
      />
    </>
  );
}
