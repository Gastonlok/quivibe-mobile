import { useState } from "react";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Text, View } from "react-native";
import { useSession } from "../../store/session";
import { users } from "../../services/api/users";
import { Button, Heading, Screen } from "../ui";
import { ErrorText, Field } from "../data";
import { typography as t } from "../../typography";
const schema = z.object({
  name: z.string(),
  email: z.string().trim().email("Adresse email invalide."),
  password: z.string().min(1, "Saisis ton mot de passe."),
});
export function AuthForm({ register = false }: { register?: boolean }) {
  const session = useSession(),
    { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const [error, setError] = useState<unknown>(null),
    [message, setMessage] = useState(""),
    [resetting, setResetting] = useState(false);
  async function submit(data: z.infer<typeof schema>) {
    setError(null);
    setMessage("");
    try {
      if (register) {
        if (data.name.trim().length < 2 || data.name.trim().length > 80) {
          form.setError("name", {
            message: "Saisis un nom de 2 à 80 caractères.",
          });
          return;
        }
        if (data.password.length < 8) {
          form.setError("password", { message: "Au moins 8 caractères." });
          return;
        }
        await users.register({ ...data, name: data.name.trim() });
        form.reset();
        setMessage(
          "Compte créé. Vérifie ton adresse email grâce au lien reçu, puis connecte-toi.",
        );
      } else {
        await session.login(data.email, data.password);
        const target =
          returnTo &&
          /^\/(reservation|confirmation|venue|reviews|account)\/[^/?#]+$|^\/(favorites|profile|explore|events)?$/.test(
            returnTo,
          )
            ? returnTo
            : "/profile";
        router.replace(target as Href);
      }
    } catch (err) {
      setError(err);
    }
  }
  return (
    <Screen>
      <Heading
        eyebrow={register ? "REJOINS LA VIBE" : "TON COMPTE QUIVIBE"}
        title={register ? "Tes sorties commencent ici." : "Bienvenue chez toi."}
        description="Le même compte sur le web et dans l’application."
      />
      {register && (
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field
              label="Nom"
              autoComplete="name"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      )}
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <Field
            label="Mot de passe"
            secureTextEntry
            autoComplete={register ? "new-password" : "current-password"}
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button
        label={
          form.formState.isSubmitting
            ? "Un instant…"
            : register
              ? "Créer mon compte"
              : "Se connecter"
        }
        disabled={form.formState.isSubmitting || resetting}
        onPress={form.handleSubmit(submit)}
      />
      <ErrorText error={error} />
      {message && (
        <Text accessibilityRole="alert" style={t.body}>
          {message}
        </Text>
      )}
      {!register && (
        <Button
          label={resetting ? "Envoi…" : "Mot de passe oublié ?"}
          secondary
          disabled={resetting || form.formState.isSubmitting}
          onPress={async () => {
            const email = form.getValues("email");
            if (!z.string().email().safeParse(email).success) {
              form.setError("email", {
                message: "Saisis ton email pour recevoir le lien.",
              });
              return;
            }
            setResetting(true);
            setError(null);
            try {
              const result = await users.reset(email);
              setMessage(result.message || "Consulte tes emails.");
            } catch (err) {
              setError(err);
            } finally {
              setResetting(false);
            }
          }}
        />
      )}
      <View style={{ gap: 12 }}>
        <Button
          label={register ? "J’ai déjà un compte" : "Créer un compte"}
          secondary
          onPress={() =>
            router.replace({
              pathname: register ? "/auth/login" : "/auth/register",
              params: { returnTo },
            })
          }
        />
        <Button
          label="Continuer à explorer"
          secondary
          onPress={() => router.replace("/")}
        />
      </View>
    </Screen>
  );
}
