import { imageUrl } from "../../utils/images";
import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Venue } from "../../types/api";
import { favorites } from "../../services/api/favorites";
import { useSession } from "../../store/session";
import { colors as c } from "../../theme";
import { typography as t } from "../../typography";
import { ErrorText } from "../data";
export function FavoriteButton({ venue }: { venue: Venue }) {
  const [scale] = useState(() => new Animated.Value(1)),
    [reduce, setReduce] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduce);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduce,
    );
    return () => subscription.remove();
  }, []);
  const session = useSession(),
    cache = useQueryClient(),
    pathname = usePathname();
  const mutation = useMutation({
    mutationFn: () => favorites.set(venue.id, !venue.isFavorite),
    onSuccess: async () => {
      await Promise.all(
        ["venues", "venue", "favorites"].map((key) =>
          cache.invalidateQueries({ queryKey: [key] }),
        ),
      );
    },
  });
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          venue.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
        }
        accessibilityState={{
          selected: venue.isFavorite,
          disabled: mutation.isPending,
        }}
        disabled={mutation.isPending}
        onPress={() => {
          if (!session.user)
            return router.push({
              pathname: "/auth/login",
              params: { returnTo: pathname },
            });
          if (!reduce)
            Animated.sequence([
              Animated.timing(scale, {
                toValue: 1.2,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 1,
                duration: 140,
                useNativeDriver: true,
              }),
            ]).start();
          mutation.mutate();
        }}
        style={({ pressed }) => [
          styles.favorite,
          {
            transform: [{ scale: pressed ? 0.9 : 1 }],
            opacity: mutation.isPending ? 0.5 : 1,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons
            name={venue.isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={venue.isFavorite ? c.primaryText : c.text}
          />
        </Animated.View>
      </Pressable>
      <ErrorText error={mutation.error} />
    </View>
  );
}
export function VenueCard({
  venue,
  horizontal = false,
}: {
  venue: Venue;
  horizontal?: boolean;
}) {
  const image = venue.media[0];
  return (
    <View style={[styles.card, horizontal && { width: 280 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={"Découvrir " + venue.name}
        onPress={() =>
          router.push({ pathname: "/venue/[id]", params: { id: venue.slug } })
        }
      >
        {image ? (
          <Image
            source={{ uri: imageUrl(image.url) }}
            style={styles.photo}
            contentFit="cover"
            transition={180}
            recyclingKey={venue.id}
            accessibilityLabel={image.altText || venue.name}
          />
        ) : (
          <View style={[styles.photo, styles.placeholder]}>
            <Ionicons name="restaurant-outline" size={40} color={c.muted} />
          </View>
        )}
        <View style={styles.body}>
          <Text style={[t.label, { color: c.text, fontSize: 18 }]}>
            {venue.name}
          </Text>
          <Text style={t.caption}>
            {venue.averageRating !== null
              ? "★ " + venue.averageRating.toFixed(1) + " · "
              : ""}
            {venue.neighborhood}
            {venue.reviewCount ? " · " + venue.reviewCount + " avis" : ""}
          </Text>
          <Text style={t.caption}>
            {venue.categories.map((v) => v.category.name).join(" · ")} ·{" "}
            {"$".repeat(Math.min(4, Math.max(1, venue.priceRange)))}
            {venue.distanceKm != null
              ? " · " + venue.distanceKm.toFixed(1) + " km"
              : ""}
          </Text>
        </View>
      </Pressable>
      <View style={styles.favoritePosition}>
        <FavoriteButton venue={venue} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 16,
  },
  photo: { width: "100%", height: 190, backgroundColor: c.soft },
  placeholder: { alignItems: "center", justifyContent: "center" },
  body: { padding: 16, gap: 7 },
  favoritePosition: { position: "absolute", right: 12, top: 12, maxWidth: 220 },
  favorite: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: c.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
