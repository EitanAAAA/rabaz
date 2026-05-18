import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

const mPlusRounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["100", "300", "700"],
  variable: "--font-mplus-rounded",
  display: "swap"
});

export const metadata: Metadata = {
  title: "המותג שלך - חוויה קולנועית",
  description: "Hero קולנועי בעברית עם גלילה אינטראקטיבית."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={mPlusRounded.variable}>
      <body className={mPlusRounded.className}>{children}</body>
    </html>
  );
}
