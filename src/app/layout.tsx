import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vitorcarvalho.photography"),
  title: "Vitor Carvalho Photography",
  description:
    "Cinematic Portrait Photography — editorial portraits, characters and atmosphere.",
  openGraph: {
    title: "Vitor Carvalho Photography",
    description:
      "Cinematic Portrait Photography — editorial portraits, characters and atmosphere.",
    images: ["/og.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vitor Carvalho Photography",
    description:
      "Cinematic Portrait Photography — editorial portraits, characters and atmosphere.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-[#0a0a0a] text-[#f5f5f5] antialiased">{children}</body>
    </html>
  );
}
