import { useQuery } from "@tanstack/react-query";
import { askAI } from "../../services/api/ai";
import { DataState } from "../data";
import { RecommendationCard } from "./RecommendationCard";
import { Text } from "react-native";
import { typography as t } from "../../typography";
export function Personalized({ vibes }: { vibes: string[] }) {
  const query = useQuery({
    queryKey: ["personalized", vibes],
    queryFn: () =>
      askAI({
        query:
          "Propose des lieux à Kinshasa pour ces envies : " + vibes.join(", "),
        history: [],
      }),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
  return (
    <>
      <DataState query={query} />
      {query.data?.recommendations?.map((item) => (
        <RecommendationCard key={item.id} item={item} />
      ))}
      {query.data && !query.data.recommendations?.length && (
        <Text style={t.body}>{query.data.message}</Text>
      )}
    </>
  );
}
