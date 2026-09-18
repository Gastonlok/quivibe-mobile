import { imageUrl } from "../../utils/images";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { useVenue } from "../../hooks/queries";
import { Heading, Screen, Section, ServiceState } from "../../components/ui";
import { DataState } from "../../components/data";
import { typography as t } from "../../typography";
export default function Menu() {
  const { id = "" } = useLocalSearchParams<{ id: string }>(),
    query = useVenue(id);
  const groups = [
    ...new Set(
      query.data?.menuItems.map((item) => item.category || "À la carte"),
    ),
  ];
  return (
    <Screen>
      <Heading title="À la carte" description={query.data?.name} />
      <DataState query={query} />
      {query.data && !groups.length && (
        <ServiceState
          title="Le menu se fait attendre"
          message="L’établissement n’a pas encore publié de menu."
          icon="restaurant-outline"
        />
      )}
      {groups.map((group) => (
        <Section key={group} title={group}>
          {query.data?.menuItems
            .filter((item) => (item.category || "À la carte") === group)
            .map((item) => (
              <View key={item.id} style={{ gap: 10, marginBottom: 16 }}>
                {item.imageUrl && (
                  <Image
                    source={{ uri: imageUrl(item.imageUrl) }}
                    style={{ width: "100%", height: 170, borderRadius: 16 }}
                    contentFit="cover"
                    accessibilityLabel={item.name}
                  />
                )}
                <Text style={t.label}>
                  {item.name}
                  {item.price ? " · " + item.price : ""}
                </Text>
                {item.description && (
                  <Text style={t.body}>{item.description}</Text>
                )}
              </View>
            ))}
        </Section>
      ))}
    </Screen>
  );
}
