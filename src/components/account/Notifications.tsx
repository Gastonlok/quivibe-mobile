import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Text, View } from "react-native";
import { z } from "zod";
import { api } from "../../services/api/client";
import { useSession } from "../../store/session";
import { Button } from "../ui";
import { DataState, ErrorText, More } from "../data";
import { typography as t } from "../../typography";
import { dateLabel } from "../../utils/dates";
const response = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      readAt: z.string().nullable(),
      message: z.object({
        subject: z.string(),
        body: z.string(),
        createdAt: z.string(),
      }),
    }),
  ),
  total: z.number(),
  unread: z.number(),
});
export function Notifications() {
  const { user } = useSession(),
    cache = useQueryClient();
  const query = useInfiniteQuery({
    queryKey: ["messages", user?.id],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      api("messages?page=" + pageParam, response, { signal }),
    getNextPageParam: (last, pages) =>
      pages.length * 30 < last.total ? pages.length + 1 : undefined,
  });
  const mutation = useMutation({
    mutationFn: (id: string) =>
      api("messages", z.object({ success: z.boolean() }), {
        method: "PATCH",
        body: { id },
      }),
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["messages"] });
    },
  });
  const items = query.data?.pages.flatMap((p) => p.messages) || [];
  return (
    <>
      <Text style={t.caption}>
        Tes messages Quivibe. Les alertes push ne sont pas activées.
      </Text>
      <DataState
        query={query}
        empty={!items.length}
        title="Tu es à jour"
        message="Tes nouveaux messages apparaîtront ici."
      />
      {items.map((item) => (
        <View key={item.id} style={{ gap: 10, paddingVertical: 16 }}>
          <Text style={t.label}>
            {!item.readAt ? "● " : ""}
            {item.message.subject}
          </Text>
          <Text style={t.caption}>{dateLabel(item.message.createdAt)}</Text>
          <Text style={t.body}>{item.message.body}</Text>
          {!item.readAt && (
            <Button
              label="Marquer comme lu"
              secondary
              disabled={mutation.isPending}
              onPress={() => mutation.mutate(item.id)}
            />
          )}
        </View>
      ))}
      <ErrorText error={mutation.error} />
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
