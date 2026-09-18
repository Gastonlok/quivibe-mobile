import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Text, View } from "react-native";
import { useSession } from "../../store/session";
import { users } from "../../services/api/users";
import { Button } from "../ui";
import { ErrorText, Field } from "../data";
import { typography as t } from "../../typography";
const schema = z.object({
  name: z.string().trim().min(2, "Au moins 2 caractères.").max(80),
  email: z.string().trim().email("Email invalide."),
});
export function ProfileEditor() {
  const session = useSession();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: session.user?.name || "",
      email: session.user?.email || "",
    },
  });
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof schema>) => {
      const result = await users.update({
        ...data,
        image: session.user?.image || "",
      });
      await session.refresh();
      return result;
    },
  });
  return (
    <View style={{ gap: 18 }}>
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field
            label="Nom"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field
            label="Email"
            value={field.value}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button
        label={
          mutation.isPending ? "Enregistrement…" : "Enregistrer mon profil"
        }
        disabled={mutation.isPending}
        onPress={form.handleSubmit((data) => mutation.mutate(data))}
      />
      <ErrorText error={mutation.error} />
      {mutation.data && (
        <Text accessibilityRole="alert" style={t.body}>
          {mutation.data.verificationRequired
            ? mutation.data.verificationSent
              ? "Profil enregistré. Vérifie ta nouvelle adresse email."
              : "Profil enregistré, mais l’email de vérification n’a pas pu être envoyé. Contacte l’assistance."
            : "Profil enregistré."}
        </Text>
      )}
    </View>
  );
}
