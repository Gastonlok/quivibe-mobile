import MapView, { Marker } from "react-native-maps";
import { Platform, Text, View } from "react-native";
import Constants from "expo-constants";
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
  if (
    Platform.OS === "android" &&
    Constants.executionEnvironment !== "storeClient" &&
    !Constants.expoConfig?.extra?.mapsConfigured
  )
    return (
      <View>
        <Text style={t.body}>
          Ouvre l’itinéraire pour afficher ce lieu dans ton application de
          cartes.
        </Text>
      </View>
    );
  return (
    <MapView
      accessibilityLabel={"Localisation : " + name}
      style={{ height: 230, width: "100%" }}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      <Marker coordinate={{ latitude, longitude }} title={name} />
    </MapView>
  );
}
