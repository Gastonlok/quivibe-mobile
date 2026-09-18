import { router, usePathname } from "expo-router";
import { Button, ServiceState } from "./ui";
import { View } from "react-native";
export function SignInGate() {
  const returnTo = usePathname();
  return (
    <View style={{ gap: 16 }}>
      <ServiceState
        title="Ton Quivibe, partout avec toi"
        message="Connecte-toi avec ton compte Quivibe pour retrouver tes favoris, tes avis et tes réservations."
        icon="person-outline"
      />
      <Button
        label="Se connecter"
        onPress={() =>
          router.push({ pathname: "/auth/login", params: { returnTo } })
        }
      />
    </View>
  );
}
