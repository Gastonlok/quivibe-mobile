import { imageUrl } from "../../utils/images";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import type { Recommendation } from "../../services/api/ai";
import { typography as t } from "../../typography";
import { colors as c } from "../../theme";
export function RecommendationCard({ item }: { item: Recommendation }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={"Découvrir " + item.name}
      onPress={() =>
        router.push({ pathname: "/venue/[id]", params: { id: item.slug } })
      }
      style={{
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: c.white,
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      {item.image && (
        <Image
          source={{ uri: imageUrl(item.image) }}
          style={{ height: 170, width: "100%" }}
          contentFit="cover"
          transition={150}
        />
      )}
      <View style={{ padding: 18, gap: 8 }}>
        <Text style={t.label}>{item.name}</Text>
        <Text style={t.caption}>
          {item.category} · {item.neighborhood} · {"$".repeat(item.priceRange)}
          {item.rating !== null ? " · ★ " + item.rating.toFixed(1) : ""}
        </Text>
        <Text style={t.body}>{item.reason}</Text>
        <Text style={[t.label, { color: c.primaryText }]}>
          Découvrir le lieu →
        </Text>
      </View>
    </Pressable>
  );
}
