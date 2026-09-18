import { useInfiniteQuery } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { reviews } from "../../services/api/reviews";
import { useSession } from "../../store/session";
import { DataState, More } from "../data";
import { typography as t } from "../../typography";
export function MyReviews() {
  const { user } = useSession();
  const query = useInfiniteQuery({
    queryKey: ["reviews", "mine", user?.id],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => reviews.list("mine", pageParam, signal),
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });
  const items = query.data?.pages.flatMap((p) => p.items) || [];
  return (
    <>
      <DataState
        query={query}
        empty={!items.length}
        title="Ton carnet d’expériences"
        message="Tes avis publiés ou en attente apparaîtront ici."
      />
      {items.map((item) => (
        <View key={item.id} style={{ gap: 8 }}>
          <Text style={t.label}>
            {item.place?.name} · {"★".repeat(item.rating)}
          </Text>
          <Text style={t.body}>{item.comment}</Text>
          <Text style={t.caption}>
            {item.status === "APPROVED"
              ? "Publié"
              : item.status === "PENDING"
                ? "En attente de modération"
                : "Non publié"}
          </Text>
        </View>
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
