import type { ConfigContext, ExpoConfig } from "expo/config";
export default ({ config }: ConfigContext): ExpoConfig => {
  const key = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  return {
    ...config,
    name: config.name || "Quivibe",
    slug: config.slug || "quivibe-mobile",
    extra: { ...config.extra, mapsConfigured: Boolean(key) },
    plugins: [
      ...(config.plugins || []),
      ...(key
        ? [
            ["react-native-maps", { androidGoogleMapsApiKey: key }] as [
              string,
              Record<string, string>,
            ],
          ]
        : []),
    ],
  };
};
