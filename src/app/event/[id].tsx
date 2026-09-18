import { imageUrl } from "../../utils/images";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Text, Share } from "react-native";
import { events } from "../../services/api/events";
import { Heading, Screen, Button } from "../../components/ui";
import { DataState } from "../../components/data";
import { dateLabel, timeLabel } from "../../utils/dates";
import { typography as t } from "../../typography";
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({
    queryKey: ["event", id],
    queryFn: ({ signal }) => events.detail(id, signal),
  });
  const event = query.data,
    photo = event?.media[0] || event?.place.media[0];
  return (
    <Screen
      refreshing={query.isRefetching}
      onRefresh={() => {
        void query.refetch();
      }}
    >
      <DataState query={query} />
      {event && (
        <>
          {photo && (
            <Image
              source={{ uri: imageUrl(photo.url) }}
              style={{ width: "100%", height: 260, borderRadius: 24 }}
              contentFit="cover"
              accessibilityLabel={photo.altText || event.title}
            />
          )}
          <Heading
            eyebrow={
              dateLabel(event.startDate) + " · " + timeLabel(event.startDate)
            }
            title={event.title}
          />
          <Text style={t.label}>
            {event.place.name} · {event.place.neighborhood}
          </Text>
          <Text style={t.body}>{event.description}</Text>
          {event.endDate && (
            <Text style={t.caption}>
              Jusqu’au {dateLabel(event.endDate)} à {timeLabel(event.endDate)}
            </Text>
          )}
          <Text style={t.body}>{event.place.address}</Text>
          <Button
            label="Découvrir le lieu"
            onPress={() =>
              router.push({
                pathname: "/venue/[id]",
                params: { id: event.place.slug },
              })
            }
          />
          <Button
            label="Partager"
            secondary
            onPress={() => {
              void Share.share({
                message:
                  event.title +
                  " · " +
                  event.place.name +
                  " · " +
                  dateLabel(event.startDate) +
                  " https://quivibe.vercel.app/places/" +
                  event.place.slug,
              });
            }}
          />
        </>
      )}
    </Screen>
  );
}
