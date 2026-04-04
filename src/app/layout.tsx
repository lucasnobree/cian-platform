import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CIAN Platform",
  description: "Plataforma de gestão para identidade visual de casamentos — CIAN Art Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
