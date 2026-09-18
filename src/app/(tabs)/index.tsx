import { useQuery } from "@tanstack/react-query";
import { search } from "../../services/api/search";
import { Personalized } from "../../components/venue/Personalized";
import { eventWindow } from "../../utils/dates";
import { useState } from "react";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Button, Heading, Screen, Section, s } from "../../components/ui";
import { Chip, DataState } from "../../components/data";
import { VenueCard } from "../../components/venue/VenueCard";
import { EventCard } from "../../components/event/EventCard";
import { useVenues, useEvents } from "../../hooks/queries";
import { usePreferences } from "../../store/preferences";
import { useSession } from "../../store/session";
import { colors as c } from "../../theme";
import { typography as t } from "../../typography";
import { discoveryCategories } from "../../constants/discovery";
export default function Home() {
  const prefs = usePreferences(),
    session = useSession();
  const [locating, setLocating] = useState(false);
  const options = useQuery({
    queryKey: ["search-options"],
    queryFn: ({ signal }) => search.options(signal),
    staleTime: 3600000,
  });
  function explore(label: string) {
    if (label === "Événements") return router.push("/events");
    const normalize = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/s$/, "");
    const category = options.data?.categories.find(
      (item) => normalize(item.name) === normalize(label),
    );
    router.push(
      category
        ? { pathname: "/explore", params: { category: category.slug } }
        : {
            pathname: "/ai",
            params: {
              prompt: "Je cherche une sortie " + label + " à Kinshasa.",
            },
          },
    );
  }
  const trending = useVenues({ sort: "rating" });
  const near = useVenues(
    prefs.position
      ? {
          lat: String(prefs.position.latitude),
          lng: String(prefs.position.longitude),
          radius: "5",
          sort: "distance",
        }
      : { sort: "rating" },
  );
  const [weekend] = useState(() => eventWindow("weekend"));
  const upcoming = useEvents(weekend);
  const refresh = () => {
    void trending.refetch();
    void near.refetch();
    void upcoming.refetch();
  };
  return (
    <Screen
      refreshing={
        trending.isRefetching || near.isRefetching || upcoming.isRefetching
      }
      onRefresh={refresh}
    >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
        <View style={s.flex}>
          <Heading
            eyebrow={
              "BONJOUR" + (session.user ? ", " + session.user.name : "") + " 👋"
            }
            title="Quelle est ta vibe aujourd’hui ?"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mon profil"
          onPress={() => router.push("/profile")}
          style={{ padding: 12, backgroundColor: c.soft, borderRadius: 24 }}
        >
          <Ionicons name="person-outline" size={25} color={c.text} />
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Rechercher une adresse"
        onPress={() => router.push("/search")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          padding: 18,
          borderRadius: 18,
          backgroundColor: c.white,
          borderWidth: 1,
          borderColor: c.border,
        }}
      >
        <Ionicons name="search" color={c.primaryText} size={24} />
        <Text style={[t.body, s.flex]}>Restaurant, café, bar, événement…</Text>
      </Pressable>
      <Section title="Explorer">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {discoveryCategories.map((item) => (
            <Chip
              key={item.label}
              label={item.label}
              onPress={() => explore(item.label)}
            />
          ))}
        </ScrollView>
      </Section>
      <Section title="Tendances à Kinshasa" href="/explore">
        <DataState
          query={trending}
          empty={!trending.data?.pages[0]?.places.length}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14 }}
        >
          {trending.data?.pages[0]?.places.map((venue) => (
            <VenueCard key={venue.id} venue={venue} horizontal />
          ))}
        </ScrollView>
      </Section>
      <Section
        title={
          prefs.position
            ? "Près de toi"
            : "Découvre les lieux populaires près de toi"
        }
      >
        {!prefs.position && (
          <Button
            label={
              locating ? "Recherche de ta position…" : "Activer ma localisation"
            }
            disabled={locating}
            secondary
            onPress={() => {
              setLocating(true);
              void prefs.locate().finally(() => setLocating(false));
            }}
          />
        )}
        {prefs.locationError ? (
          <Text style={t.caption}>{prefs.locationError}</Text>
        ) : null}
        <DataState query={near} empty={!near.data?.pages[0]?.places.length} />
        <ScrollView
          horizontal
          contentContainerStyle={{ gap: 14 }}
          showsHorizontalScrollIndicator={false}
        >
          {near.data?.pages[0]?.places.slice(0, 6).map((venue) => (
            <VenueCard key={venue.id} venue={venue} horizontal />
          ))}
        </ScrollView>
      </Section>
      {prefs.value.vibes.length > 0 && (
        <Section title="Pour toi">
          <Personalized vibes={prefs.value.vibes} />
          <Text style={s.body}>Tes envies du moment</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {prefs.value.vibes.map((vibe) => (
              <Chip
                key={vibe}
                label={vibe}
                onPress={() =>
                  router.push({
                    pathname: "/ai",
                    params: {
                      prompt: "Je cherche une sortie " + vibe + " à Kinshasa.",
                    },
                  })
                }
              />
            ))}
          </View>
        </Section>
      )}
      <View
        style={{
          backgroundColor: c.secondary,
          borderRadius: 24,
          padding: 24,
          gap: 14,
        }}
      >
        <Ionicons name="sparkles" color={c.primary} size={30} />
        <Text style={[t.section, { color: c.white }]}>
          Tu ne sais pas où aller ?
        </Text>
        <Text style={[t.body, { color: "#DDDDD8" }]}>
          Demande à Quivibe AI.
        </Text>
        <Button label="Trouver ma vibe" onPress={() => router.push("/ai")} />
      </View>
      <Section title="Ce week-end" href="/events">
        <DataState
          query={upcoming}
          empty={!upcoming.data?.pages[0]?.items.length}
          title="Le prochain rendez-vous arrive"
          message="Aucun événement annoncé pour le moment."
        />
        {upcoming.data?.pages[0]?.items.slice(0, 3).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </Section>
    </Screen>
  );
}
