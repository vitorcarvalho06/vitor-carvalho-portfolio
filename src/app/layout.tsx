import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitor Carvalho Photography - Cinematic Portrait Photography",
  description: "Galeria editorial cinematografica de retratos por Vitor Carvalho.",
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
