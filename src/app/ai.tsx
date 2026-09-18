import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { ActivityIndicator, Text, View } from "react-native";
import {
  askAI,
  type ChatMessage,
  type Recommendation,
} from "../services/api/ai";
import { Heading, Screen, Button } from "../components/ui";
import { Chip, ErrorText, Field } from "../components/data";
import { RecommendationCard } from "../components/venue/RecommendationCard";
import { usePreferences } from "../store/preferences";
import { typography as t } from "../typography";
import { colors as c } from "../theme";
type Turn = ChatMessage & { recommendations?: Recommendation[] };
export default function AI() {
  const { prompt } = useLocalSearchParams<{ prompt?: string }>();
  const [input, setInput] = useState(prompt || ""),
    [turns, setTurns] = useState<Turn[]>([]),
    [context, setContext] = useState<Record<string, unknown>>(),
    [previousIds, setPreviousIds] = useState<string[]>([]);
  const prefs = usePreferences();
  const mutation = useMutation({
    mutationFn: (query: string) =>
      askAI({
        query,
        history: turns.slice(-12).map(({ role, content }) => ({
          role,
          content: content.slice(0, 2000),
        })),
        context,
        previousIds,
        position: prefs.position || undefined,
      }),
    onSuccess: (result, query) => {
      setTurns((old) =>
        [
          ...old,
          { role: "user" as const, content: query },
          {
            role: "assistant" as const,
            content: result.message,
            recommendations: result.recommendations || [],
          },
        ].slice(-24),
      );
      setContext(result.context);
      if (result.recommendations)
        setPreviousIds(result.recommendations.map((r) => r.id).slice(0, 3));
      setInput("");
    },
  });
  const send = () => {
    const query = input.trim();
    if (query.length >= 2 && !mutation.isPending) mutation.mutate(query);
  };
  return (
    <Screen>
      <Heading
        eyebrow="QUIVIBE AI"
        title="Dis-nous ton envie."
        description="Un dîner calme à Gombe ? Un brunch en famille ? On cherche ensemble."
      />
      {turns.length === 0 && (
        <View style={{ gap: 8 }}>
          {[
            "Un dîner romantique à Gombe",
            "Un brunch en famille",
            "Un endroit calme pour travailler",
          ].map((text) => (
            <Chip key={text} label={text} onPress={() => setInput(text)} />
          ))}
        </View>
      )}
      {turns.map((turn, i) => (
        <View key={i} style={{ gap: 12 }}>
          <View
            style={{
              padding: 18,
              borderRadius: 20,
              backgroundColor: turn.role === "user" ? c.soft : c.white,
              borderWidth: 1,
              borderColor: c.border,
            }}
          >
            <Text
              style={[t.caption, { color: c.primaryText, marginBottom: 6 }]}
            >
              {turn.role === "user" ? "Toi" : "Quivibe AI"}
            </Text>
            <Text selectable style={t.body}>
              {turn.content}
            </Text>
          </View>
          {turn.recommendations?.map((item) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
        </View>
      ))}
      {mutation.isPending && (
        <View
          accessibilityRole="progressbar"
          style={{ flexDirection: "row", gap: 12 }}
        >
          <ActivityIndicator color={c.primaryText} />
          <Text style={t.body}>Je cherche ta vibe…</Text>
        </View>
      )}
      <ErrorText error={mutation.error} />
      <Field
        label="Ton envie"
        placeholder="Je cherche un endroit…"
        multiline
        maxLength={500}
        value={input}
        editable={!mutation.isPending}
        onChangeText={setInput}
      />
      <Button
        label={
          mutation.isPending
            ? "Recherche…"
            : mutation.isError
              ? "Réessayer"
              : "Envoyer"
        }
        disabled={mutation.isPending || input.trim().length < 2}
        onPress={send}
      />
      <Button
        label="Près de moi"
        secondary
        disabled={mutation.isPending}
        onPress={() => {
          void prefs.locate().then((position) => {
            if (position) setInput("Je cherche un endroit près de moi");
          });
        }}
      />
      {prefs.locationError && (
        <Text style={t.caption}>{prefs.locationError}</Text>
      )}
      {turns.length > 0 && (
        <Button
          label="Nouvelle conversation"
          secondary
          disabled={mutation.isPending}
          onPress={() => {
            setTurns([]);
            setContext(undefined);
            setPreviousIds([]);
            mutation.reset();
            setInput("");
          }}
        />
      )}
    </Screen>
  );
}
