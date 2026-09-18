import { imageUrl } from "../utils/images";
import { useState } from "react";
import { Image } from "expo-image";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePreferences } from "../store/preferences";
import { useVenues } from "../hooks/queries";
import { Button, Heading, s } from "../components/ui";
import { Chip, ErrorText } from "../components/data";
import { colors as c } from "../theme";
import { typography as t } from "../typography";
const choices = [
  "Restaurants",
  "Cafés",
  "Bars & Lounges",
  "Live Music",
  "Brunch",
  "Soirées",
  "Romantique",
  "Chill",
  "Business",
  "Family",
];
export default function Onboarding() {
  const prefs = usePreferences(),
    query = useVenues({ sort: "rating" });
  const [step, setStep] = useState(0),
    [selected, setSelected] = useState(prefs.value.vibes),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const photo = query.data?.pages[0]?.places.find((v) => v.media.length)
    ?.media[0];
  async function finish(locate = false) {
    setBusy(true);
    setError("");
    try {
      if (locate) await prefs.locate();
      await prefs.save({ completed: true, vibes: selected });
    } catch {
      setError("Impossible de mémoriser tes choix. Réessaie.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <SafeAreaView style={s.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <Text style={[t.label, { fontSize: 23 }]}>
            Quivibe<Text style={{ color: c.primary }}>.</Text>
          </Text>
          <Button
            label="Passer"
            secondary
            disabled={busy}
            onPress={() => void finish()}
          />
        </View>
        {step === 0 ? (
          <>
            <View style={styles.visual}>
              {photo ? (
                <Image
                  source={{ uri: imageUrl(photo.url) }}
                  accessibilityLabel={
                    photo.altText || "Une adresse Quivibe à Kinshasa"
                  }
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.skyline}>
                  {[70, 110, 160, 100, 135, 85].map((height, i) => (
                    <View
                      key={i}
                      style={{
                        height,
                        width: 32,
                        borderRadius: 6,
                        backgroundColor: i % 2 ? c.primary : "#D9C6AF",
                      }}
                    />
                  ))}
                </View>
              )}
              <View style={styles.caption}>
                <Text style={[t.eyebrow, { color: c.white }]}>
                  TA VIBE. TON ENDROIT.
                </Text>
              </View>
            </View>
            <Heading
              title="Kinshasa bouge."
              description="Découvre les restaurants, cafés, bars, événements et endroits qui font vibrer la ville."
            />
            <Button label="Découvrir Quivibe" onPress={() => setStep(1)} />
          </>
        ) : step === 1 ? (
          <>
            <Heading
              title="Quelle est ta vibe ?"
              description="Choisis ce que tu aimes pour personnaliser tes découvertes."
            />
            <View style={styles.choices}>
              {choices.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  selected={selected.includes(label)}
                  onPress={() =>
                    setSelected((values) =>
                      values.includes(label)
                        ? values.filter((v) => v !== label)
                        : [...values, label],
                    )
                  }
                />
              ))}
            </View>
            <Button label="Continuer" onPress={() => setStep(2)} />
            <Button label="Retour" secondary onPress={() => setStep(0)} />
          </>
        ) : (
          <>
            <View style={[styles.visual, styles.map]}>
              <View style={styles.river} />
              <Ionicons name="location" size={76} color={c.primaryText} />
              <Text style={t.label}>KINSHASA</Text>
              <Text style={t.caption}>Illustration de proximité</Text>
            </View>
            <Heading
              title="Découvre ce qui est près de toi"
              description="Autorise Quivibe à utiliser ta localisation pour trouver les meilleurs endroits autour de toi."
            />
            <Button
              label={busy ? "Un instant…" : "Activer ma localisation"}
              disabled={busy}
              onPress={() => void finish(true)}
            />
            <Button
              label="Plus tard"
              secondary
              disabled={busy}
              onPress={() => void finish()}
            />
          </>
        )}
        <ErrorText error={error} />
        <View
          accessibilityLabel={"Étape " + (step + 1) + " sur 3"}
          style={styles.dots}
        >
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === step ? c.primary : c.border,
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 24,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
    flexGrow: 1,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  visual: {
    height: 280,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: c.soft,
  },
  skyline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 9,
    paddingBottom: 50,
  },
  caption: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: c.secondary,
    padding: 18,
  },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  dots: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
    marginTop: "auto",
  },
  map: { alignItems: "center", justifyContent: "center", gap: 8 },
  river: {
    position: "absolute",
    backgroundColor: "#D9E8E2",
    height: 65,
    width: "150%",
    transform: [{ rotate: "-30deg" }],
  },
});
