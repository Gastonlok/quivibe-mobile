import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { View, Text } from "react-native";
import { Heading, Screen, Section, Button } from "../../components/ui";
import { Chip, DataState, ErrorText, Field } from "../../components/data";
import { search } from "../../services/api/search";
import { usePreferences } from "../../store/preferences";
import { typography as t } from "../../typography";
const vibes = [
  "Chill",
  "Party",
  "Romantique",
  "Brunch",
  "Family",
  "Live Music",
];
export default function Search() {
  const prefs = usePreferences();
  const [value, setValue] = useState(""),
    [debounced, setDebounced] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), 250);
    return () => clearTimeout(timer);
  }, [value]);
  const suggestions = useQuery({
    queryKey: ["suggestions", debounced],
    queryFn: ({ signal }) => search.suggestions(debounced, signal),
    enabled: debounced.length >= 2,
  });
  const options = useQuery({
    queryKey: ["search-options"],
    queryFn: ({ signal }) => search.options(signal),
    staleTime: 300000,
  });
  async function submit(term: string) {
    if (!term.trim()) return;
    setError("");
    try {
      await prefs.save({
        recent: [
          term.trim(),
          ...prefs.value.recent.filter((v) => v !== term.trim()),
        ].slice(0, 8),
      });
    } catch {
      setError("L’historique ne peut pas être enregistré sur cet appareil.");
    }
    router.push({ pathname: "/explore", params: { search: term.trim() } });
  }
  return (
    <Screen>
      <Heading title="Que recherches-tu ?" />
      <Field
        label="Rechercher"
        placeholder="Que recherches-tu ?"
        value={value}
        onChangeText={setValue}
        autoFocus
        returnKeyType="search"
        onSubmitEditing={() => void submit(value)}
      />
      <Button
        label="Voir les résultats"
        disabled={!value.trim()}
        onPress={() => void submit(value)}
      />
      <ErrorText error={error} />
      {debounced.length >= 2 && (
        <Section title="Suggestions">
          <DataState
            query={suggestions}
            empty={suggestions.data?.length === 0}
            title="Aucune suggestion"
            message="Lance la recherche pour explorer les autres résultats."
          />
          {suggestions.data?.map((item) => (
            <Chip
              key={item.id}
              label={item.name + " · " + item.neighborhood}
              onPress={() => void submit(item.name)}
            />
          ))}
        </Section>
      )}
      <Section title="Recherches récentes">
        {prefs.value.recent.length ? (
          <>
            <View style={{ gap: 10 }}>
              {prefs.value.recent.map((term) => (
                <Chip
                  key={term}
                  label={term}
                  onPress={() => void submit(term)}
                />
              ))}
            </View>
            <Button
              label="Effacer l’historique"
              secondary
              onPress={() => {
                void prefs
                  .save({ recent: [] })
                  .catch(() => setError("Impossible d’effacer l’historique."));
              }}
            />
          </>
        ) : (
          <Text style={t.body}>
            Tes prochaines recherches apparaîtront ici.
          </Text>
        )}
      </Section>
      <Section title="Explorer par vibe">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {vibes.map((vibe) => (
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
      <Section title="Explorer par zone">
        <DataState
          query={options}
          empty={options.data?.neighborhoods.length === 0}
          title="Aucune zone disponible"
          message="Les quartiers seront affichés à partir des adresses publiées."
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {options.data?.neighborhoods.map((zone) => (
            <Chip
              key={zone}
              label={zone}
              onPress={() =>
                router.push({
                  pathname: "/explore",
                  params: { neighborhood: zone },
                })
              }
            />
          ))}
        </View>
      </Section>
    </Screen>
  );
}
