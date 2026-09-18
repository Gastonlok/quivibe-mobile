import type { ComponentProps } from "react";
import type Ionicons from "@expo/vector-icons/Ionicons";
export type IconName = ComponentProps<typeof Ionicons>["name"];
// Discovery labels are matched to server categories; other vibes open Quivibe AI.
export const discoveryCategories: { label: string; icon: IconName }[] = [
  { label: "Restaurants", icon: "restaurant-outline" },
  { label: "Cafés", icon: "cafe-outline" },
  { label: "Bars", icon: "wine-outline" },
  { label: "Lounges", icon: "moon-outline" },
  { label: "Live Music", icon: "musical-notes-outline" },
  { label: "Brunch", icon: "sunny-outline" },
  { label: "Loisirs", icon: "game-controller-outline" },
  { label: "Événements", icon: "calendar-outline" },
];
