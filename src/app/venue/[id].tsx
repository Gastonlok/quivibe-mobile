import { imageUrl } from "../../utils/images";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {
  Linking,
  ScrollView,
  Share,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useVenue } from "../../hooks/queries";
import { reviews } from "../../services/api/reviews";
import { API_URL } from "../../services/api/client";
import { Button, Heading, Screen, Section, s } from "../../components/ui";
import { DataState, ErrorText } from "../../components/data";
import { FavoriteButton } from "../../components/venue/VenueCard";
import MapPreview from "../../components/venue/MapPreview";
import { typography as t } from "../../typography";
import { useSession } from "../../store/session";
export default function Venue() {
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const query = useVenue(id),
    session = useSession(),
    [error, setError] = useState("");
  const venue = query.data,
    width = Math.min(useWindowDimensions().width, 720) - 48;
  const reviewQuery = useQuery({
    queryKey: ["reviews", venue?.id],
    queryFn: ({ signal }) => reviews.list(venue!.id, 1, signal),
    enabled: Boolean(venue),
  });
  const open = (url: string) => {
    setError("");
    void Linking.openURL(url).catch(() =>
      setError("Impossible d’ouvrir cette action sur cet appareil."),
    );
  };
  return (
    <Screen
      refreshing={query.isRefetching}
      onRefresh={() => {
        void query.refetch();
      }}
    >
      <DataState query={query} />
      {venue && (
        <>
          {venue.media.length > 0 && (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator>
              {venue.media.map((media, index) => (
                <Image
                  key={media.url + index}
                  source={{ uri: imageUrl(media.url) }}
                  style={{ width, height: 290, borderRadius: 22 }}
                  contentFit="cover"
                  accessibilityLabel={
                    media.altText || venue.name + " · photo " + (index + 1)
                  }
                />
              ))}
            </ScrollView>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={s.flex}>
              <Heading
                title={venue.name}
                description={
                  venue.categories.map((v) => v.category.name).join(" · ") +
                  " · " +
                  venue.neighborhood +
                  " · " +
                  "$".repeat(venue.priceRange)
                }
              />
            </View>
            <FavoriteButton venue={venue} />
          </View>
          <Text style={t.body}>
            {venue.averageRating === null
              ? "Pas encore de note"
              : "★ " +
                venue.averageRating.toFixed(1) +
                " (" +
                venue.reviewCount +
                " avis)"}
          </Text>
          <Text style={t.body}>{venue.description}</Text>
          {venue.reservationsEnabled && (
            <Button
              label="Réserver une table"
              onPress={() =>
                router.push(
                  session.user
                    ? {
                        pathname: "/reservation/[id]",
                        params: { id: venue.slug },
                      }
                    : {
                        pathname: "/auth/login",
                        params: { returnTo: "/reservation/" + venue.slug },
                      },
                )
              }
            />
          )}
          <Button
            label="Itinéraire"
            secondary
            onPress={() =>
              open(
                "https://www.google.com/maps/dir/?api=1&destination=" +
                  venue.latitude +
                  "," +
                  venue.longitude,
              )
            }
          />
          {venue.phone && (
            <Button
              label="Appeler"
              secondary
              onPress={() => open("tel:" + venue.phone!.replace(/[^+\d]/g, ""))}
            />
          )}
          <Button
            label="Partager ce lieu"
            secondary
            onPress={() => {
              void Share.share({
                message:
                  venue.name +
                  " sur Quivibe : " +
                  API_URL +
                  "/places/" +
                  encodeURIComponent(venue.slug),
              }).catch(() => setError("Le partage n’est pas disponible."));
            }}
          />
          <ErrorText error={error} />
          <Section title="Sur place">
            <Text style={t.body}>{venue.address}</Text>
            <Text style={t.caption}>
              Horaires d’ouverture à confirmer auprès de l’établissement.
            </Text>
          </Section>
          <Section title="Menu">
            {venue.menuItems.slice(0, 3).map((item) => (
              <View key={item.id} style={{ gap: 5 }}>
                <Text style={t.label}>
                  {item.name}
                  {item.price ? " · " + item.price : ""}
                </Text>
                {item.description && (
                  <Text style={t.caption}>{item.description}</Text>
                )}
              </View>
            ))}
            {!venue.menuItems.length && (
              <Text style={t.body}>
                Ce lieu n’a pas encore publié son menu.
              </Text>
            )}
            <Button
              label="Voir le menu complet"
              secondary
              onPress={() =>
                router.push({
                  pathname: "/menu/[id]",
                  params: { id: venue.slug },
                })
              }
            />
          </Section>
          <Section title="Avis">
            <DataState
              query={reviewQuery}
              empty={!reviewQuery.data?.items.length}
              title="La première impression compte"
              message="Aucun avis publié pour le moment."
            />
            {reviewQuery.data?.items.slice(0, 2).map((review) => (
              <View key={review.id} style={{ gap: 6 }}>
                <Text style={t.label}>
                  {review.author?.name} · {"★".repeat(review.rating)}
                </Text>
                <Text style={t.body}>{review.comment}</Text>
              </View>
            ))}
            <Button
              label="Voir tous les avis"
              secondary
              onPress={() =>
                router.push({
                  pathname: "/reviews/[id]",
                  params: { id: venue.id },
                })
              }
            />
          </Section>
          <Section title="Localisation">
            <MapPreview
              latitude={venue.latitude}
              longitude={venue.longitude}
              name={venue.name}
            />
            <Button
              label="Ouvrir l’itinéraire"
              secondary
              onPress={() =>
                open(
                  "https://www.google.com/maps/dir/?api=1&destination=" +
                    venue.latitude +
                    "," +
                    venue.longitude,
                )
              }
            />
          </Section>
        </>
      )}
    </Screen>
  );
}
