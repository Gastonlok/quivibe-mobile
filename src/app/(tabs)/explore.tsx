import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { FlatList, Modal, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVenues } from "../../hooks/queries";
import { search } from "../../services/api/search";
import { usePreferences } from "../../store/preferences";
import { Button, Heading, Section, s } from "../../components/ui";
import { Chip, DataState, More } from "../../components/data";
import { VenueCard } from "../../components/venue/VenueCard";
import { typography as t } from "../../typography";
export default function Explore() {
  const p = useLocalSearchParams<{
    search?: string;
    neighborhood?: string;
    category?: string;
    priceRange?: string;
    minRating?: string;
    sort?: string;
    reservationsOnly?: string;
    lat?: string;
    lng?: string;
  }>();
  const filters: Record<string, string> = {};
  for (const key of [
    "search",
    "neighborhood",
    "category",
    "priceRange",
    "minRating",
    "sort",
    "reservationsOnly",
    "lat",
    "lng",
  ] as const)
    if (typeof p[key] === "string" && p[key]) filters[key] = p[key];
  const query = useVenues(filters),
    prefs = usePreferences();
  const options = useQuery({
    queryKey: ["search-options"],
    queryFn: ({ signal }) => search.options(signal),
    staleTime: 300000,
  });
  const [open, setOpen] = useState(false),
    [locating, setLocating] = useState(false);
  const venues = query.data?.pages.flatMap((page) => page.places) || [];
  const set = (key: string, value: string) =>
    router.setParams({ [key]: filters[key] === value ? "" : value });
  return (
    <SafeAreaView edges={["left", "right"]} style={s.screen}>
      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.content}
        refreshing={query.isRefetching}
        onRefresh={() => {
          void query.refetch();
        }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (
            query.hasNextPage &&
            !query.isFetching &&
            !query.isFetchNextPageError
          )
            void query.fetchNextPage();
        }}
        ListHeaderComponent={
          <View style={{ gap: 20 }}>
            <Heading
              eyebrow="EXPLORER KINSHASA"
              title={filters.search || "À chacun sa vibe."}
              description={
                filters.neighborhood
                  ? "Les adresses de " + filters.neighborhood
                  : "Trouve ton prochain endroit."
              }
            />
            <Button
              label="Rechercher une adresse"
              secondary
              onPress={() => router.push("/search")}
            />
            <Text style={t.caption}>
              {query.data
                ? query.data.pages[0].total +
                  " résultat" +
                  (query.data.pages[0].total > 1 ? "s" : "")
                : "Découverte des adresses…"}
            </Text>
            <ScrollView
              horizontal
              contentContainerStyle={{ gap: 8 }}
              showsHorizontalScrollIndicator={false}
            >
              <Chip
                label="Filtres"
                selected={Object.keys(filters).length > 0}
                onPress={() => setOpen(true)}
              />
              <Chip
                label="Prix"
                selected={Boolean(p.priceRange)}
                onPress={() => setOpen(true)}
              />
              <Chip
                label="Note"
                selected={Boolean(p.minRating)}
                onPress={() => setOpen(true)}
              />
              <Chip
                label="Distance"
                selected={p.sort === "distance"}
                onPress={() => setOpen(true)}
              />
              <Chip
                label="Réservation"
                selected={p.reservationsOnly === "true"}
                onPress={() => set("reservationsOnly", "true")}
              />
              <Chip label="Vibe" onPress={() => router.push("/ai")} />
            </ScrollView>
            <DataState query={query} empty={!venues.length} />
          </View>
        }
        renderItem={({ item }) => <VenueCard venue={item} />}
        ListFooterComponent={
          <More
            hasNext={query.hasNextPage}
            loading={query.isFetchingNextPage}
            onPress={() => {
              void query.fetchNextPage();
            }}
          />
        }
      />
      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={s.screen}>
          <ScrollView contentContainerStyle={s.content}>
            <Heading title="Ta sortie, tes critères." />
            <Section title="Prix">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {[1, 2, 3, 4].map((n) => (
                  <Chip
                    key={n}
                    label={"$".repeat(n)}
                    selected={p.priceRange === String(n)}
                    onPress={() => set("priceRange", String(n))}
                  />
                ))}
              </View>
            </Section>
            <Section title="Note minimale">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {[3, 4, 4.5].map((n) => (
                  <Chip
                    key={n}
                    label={"★ " + n + "+"}
                    selected={p.minRating === String(n)}
                    onPress={() => set("minRating", String(n))}
                  />
                ))}
              </View>
            </Section>
            <Section title="Quartier">
              <DataState query={options} />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {options.data?.neighborhoods.map((zone) => (
                  <Chip
                    key={zone}
                    label={zone}
                    selected={p.neighborhood === zone}
                    onPress={() => set("neighborhood", zone)}
                  />
                ))}
              </View>
            </Section>
            <Section title="Catégorie">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {options.data?.categories.map((category) => (
                  <Chip
                    key={category.slug}
                    label={category.name}
                    selected={p.category === category.slug}
                    onPress={() => set("category", category.slug)}
                  />
                ))}
              </View>
            </Section>
            <Section title="Trier">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {[
                  ["recent", "Nouveautés"],
                  ["rating", "Mieux notés"],
                  ["price", "Prix"],
                ].map(([value, label]) => (
                  <Chip
                    key={value}
                    label={label}
                    selected={p.sort === value}
                    onPress={() => set("sort", value)}
                  />
                ))}
              </View>
              <Button
                label={
                  locating
                    ? "Recherche de ta position…"
                    : "Les plus proches de moi"
                }
                disabled={locating}
                secondary
                onPress={async () => {
                  setLocating(true);
                  await prefs.locate();
                  setLocating(false);
                }}
              />
              {prefs.position && (
                <Button
                  label="Appliquer ma position · 5 km"
                  secondary
                  onPress={() =>
                    router.setParams({
                      lat: String(prefs.position!.latitude),
                      lng: String(prefs.position!.longitude),
                      sort: "distance",
                    })
                  }
                />
              )}
              {prefs.locationError && (
                <Text style={t.caption}>{prefs.locationError}</Text>
              )}
            </Section>
            <Text style={t.caption}>
              Les horaires d’ouverture ne sont pas encore renseignés. Les
              créneaux de réservation sont vérifiés séparément.
            </Text>
            <Button label="Voir les résultats" onPress={() => setOpen(false)} />
            <Button
              label="Réinitialiser"
              secondary
              onPress={() =>
                router.setParams({
                  search: "",
                  category: "",
                  neighborhood: "",
                  priceRange: "",
                  minRating: "",
                  sort: "",
                  reservationsOnly: "",
                  lat: "",
                  lng: "",
                })
              }
            />
            <Button label="Fermer" secondary onPress={() => setOpen(false)} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
