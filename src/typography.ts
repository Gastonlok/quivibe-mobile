import type { TextStyle } from "react-native";
// Noto Sans is the Latin interface family declared by jw.org.
// Explicit bundled faces avoid platform-dependent fallbacks and synthetic bold.
export const fonts = {
  regular: "NotoSans_400Regular",
  bold: "NotoSans_700Bold",
};
export const typography = {
  title: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 40 },
  section: { fontFamily: fonts.regular, fontSize: 22, lineHeight: 30 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 25 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },
  label: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22 },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 17,
    letterSpacing: 0.8,
  },
} satisfies Record<string, TextStyle>;
