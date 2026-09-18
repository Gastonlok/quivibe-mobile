import { useLocalSearchParams } from "expo-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { reviews } from "../../services/api/reviews";
import { useSession } from "../../store/session";
import { SignInGate } from "../../components/SignInGate";
import { Button, Heading, s } from "../../components/ui";
import { Chip, DataState, ErrorText, Field, More } from "../../components/data";
import { typography as t } from "../../typography";
const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .min(10, "Écris au moins 10 caractères.")
    .max(1000, "1000 caractères maximum."),
});
export default function Reviews() {
  const { id = "" } = useLocalSearchParams<{ id: string }>(),
    session = useSession(),
    cache = useQueryClient();
  const query = useInfiniteQuery({
    queryKey: ["reviews", id],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => reviews.list(id, pageParam, signal),
    getNextPageParam: (last) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  });
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5, comment: "" },
  });
  const mutation = useMutation({
    mutationFn: (input: z.infer<typeof schema>) =>
      reviews.create({ ...input, placeId: id }),
    onSuccess: () => {
      form.reset();
      void cache.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
  const items = query.data?.pages.flatMap((p) => p.items) || [];
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
        ListHeaderComponent={
          <View style={{ gap: 22 }}>
            <Heading title="La communauté en parle" />
            <DataState
              query={query}
              empty={!items.length}
              title="Aucun avis publié"
              message="Partage ton expérience après ta visite."
            />
            {session.user ? (
              <View style={{ gap: 14 }}>
                <Text style={t.section}>Ton expérience</Text>
                <Controller
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Chip
                          key={value}
                          label={"★ " + value}
                          selected={field.value === value}
                          onPress={() => field.onChange(value)}
                        />
                      ))}
                    </View>
                  )}
                />
                <Controller
                  control={form.control}
                  name="comment"
                  render={({ field, fieldState }) => (
                    <Field
                      label="Ton avis"
                      multiline
                      maxLength={1000}
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <Button
                  label={mutation.isPending ? "Envoi…" : "Publier mon avis"}
                  disabled={mutation.isPending}
                  onPress={form.handleSubmit((data) => mutation.mutate(data))}
                />
                <ErrorText error={mutation.error} />
                {mutation.data && (
                  <Text accessibilityRole="alert" style={t.body}>
                    {mutation.data.message}
                  </Text>
                )}
              </View>
            ) : (
              <SignInGate />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ gap: 8 }}>
            <Text style={t.label}>
              {item.author?.name} · {"★".repeat(item.rating)}
            </Text>
            <Text style={t.body}>{item.comment}</Text>
            {item.response && (
              <Text style={t.caption}>
                Réponse du lieu : {item.response.body}
              </Text>
            )}
          </View>
        )}
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
