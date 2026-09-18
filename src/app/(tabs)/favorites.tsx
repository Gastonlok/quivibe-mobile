import { useInfiniteQuery } from "@tanstack/react-query";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { favorites } from "../../services/api/favorites";
import { useSession } from "../../store/session";
import { Heading, Screen, s } from "../../components/ui";
import { SignInGate } from "../../components/SignInGate";
import { DataState, More } from "../../components/data";
import { VenueCard } from "../../components/venue/VenueCard";
export default function Favorites() {
  const { user } = useSession();
  const query = useInfiniteQuery({
    queryKey: ["favorites", user?.id],
    enabled: Boolean(user),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => favorites.list(pageParam, signal),
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });
  if (!user)
    return (
      <Screen>
        <Heading title="Tes coups de cœur" />
        <SignInGate />
      </Screen>
    );
  const items = query.data?.pages.flatMap((p) => p.items) || [];
  return (
    <SafeAreaView edges={["left", "right"]} style={s.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.content}
        refreshing={query.isRefetching}
        onRefresh={() => {
          void query.refetch();
        }}
        ListHeaderComponent={
          <View style={{ gap: 20 }}>
            <Heading title="Tes coups de cœur" />
            <DataState
              query={query}
              empty={!items.length}
              title="Aucun favori pour le moment."
              message="Explore Kinshasa et sauvegarde les endroits que tu aimerais découvrir."
            />
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
    </SafeAreaView>
  );
}
