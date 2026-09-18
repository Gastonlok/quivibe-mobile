import { useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading, s } from "../../components/ui";
import { Chip, DataState } from "../../components/data";
import { EventCard } from "../../components/event/EventCard";
import { useEvents } from "../../hooks/queries";
import { eventWindow } from "../../utils/dates";
export default function Events() {
  const [period, setPeriod] = useState<"today" | "weekend" | "upcoming">(
    "upcoming",
  );
  const [filters, setFilters] = useState(() => eventWindow("upcoming"));
  const query = useEvents(filters),
    items = query.data?.pages.flatMap((p) => p.items) || [];
  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={s.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.content}
        refreshing={query.isRefetching}
        onRefresh={() => {
          void query.refetch();
        }}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage)
            void query.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={{ gap: 20 }}>
            <Heading
              eyebrow="KINSHASA FAIT LE SHOW"
              title="Les événements"
              description="Concerts, soirées et rendez-vous à partager."
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(
                [
                  ["today", "Aujourd’hui"],
                  ["weekend", "Ce week-end"],
                  ["upcoming", "À venir"],
                ] as const
              ).map(([value, label]) => (
                <Chip
                  key={value}
                  label={label}
                  selected={period === value}
                  onPress={() => {
                    setPeriod(value);
                    setFilters(eventWindow(value));
                  }}
                />
              ))}
            </View>
            <DataState
              query={query}
              empty={!items.length}
              title="Le programme se prépare"
              message="Aucun événement annoncé sur cette période."
            />
          </View>
        }
        renderItem={({ item }) => <EventCard event={item} />}
      />
    </SafeAreaView>
  );
}
