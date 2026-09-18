import { View, Text } from "react-native";
import { typography as t } from "../../typography";
export default function MapPreview({
  latitude,
  longitude,
  name,
}: {
  latitude: number;
  longitude: number;
  name: string;
}) {
  return (
    <View style={{ height: 230, borderRadius: 18, overflow: "hidden" }}>
      <iframe
        title={"Localisation : " + name}
        style={{ border: 0, width: "100%", height: "100%" }}
        loading="lazy"
        src={
          "https://www.openstreetmap.org/export/embed.html?bbox=" +
          [
            longitude - 0.015,
            latitude - 0.01,
            longitude + 0.015,
            latitude + 0.01,
          ].join(",") +
          "&layer=mapnik&marker=" +
          latitude +
          "," +
          longitude
        }
      />
      <Text style={t.caption}>© OpenStreetMap</Text>
    </View>
  );
}
