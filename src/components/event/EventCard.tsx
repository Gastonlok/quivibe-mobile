import { imageUrl } from "../../utils/images";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { QuivibeEvent } from "../../types/api";
import { dateLabel, timeLabel } from "../../utils/dates";
import { colors as c } from "../../theme";
import { typography as t } from "../../typography";
export function EventCard({ event }: { event: QuivibeEvent }) {
  const image = event.media[0] || event.place.media[0];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: "/event/[id]", params: { id: event.id } })
      }
      style={{
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: c.white,
        borderWidth: 1,
        borderColor: c.border,
        marginBottom: 16,
      }}
    >
      {image ? (
        <Image
          source={{ uri: imageUrl(image.url) }}
          accessibilityLabel={image.altText || event.title}
          style={{ height: 190, width: "100%" }}
          contentFit="cover"
          transition={180}
        />
      ) : (
        <View
          style={{
            height: 150,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: c.soft,
          }}
        >
          <Ionicons name="calendar-outline" size={40} color={c.primaryText} />
        </View>
      )}
      <View style={{ padding: 18, gap: 8 }}>
        <Text style={[t.eyebrow, { color: c.primaryText }]}>
          {dateLabel(event.startDate)} · {timeLabel(event.startDate)}
        </Text>
        <Text style={[t.label, { fontSize: 19 }]}>{event.title}</Text>
        <Text style={t.caption}>
          {event.place.name} · {event.place.neighborhood}
        </Text>
      </View>
    </Pressable>
  );
}
