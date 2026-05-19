import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
