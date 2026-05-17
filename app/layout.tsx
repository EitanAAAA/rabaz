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
      <head>
        <link
          rel="preload"
          href="/fonts/assistant-bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
