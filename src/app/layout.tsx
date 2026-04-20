import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import { ModalProvider } from "@/contexts/ModalContext";
import CreateModal from "@/components/create/CreateModal";

export const metadata: Metadata = {
  title: "Opinext — La voz de la comunidad",
  description:
    "Descubrí qué opina la comunidad. Listas, puntuaciones y opiniones creadas por personas como vos. Lugares, eventos, experiencias y mucho más.",
  keywords: ["opiniones", "reseñas", "listas", "comunidad", "ratings", "red social"],
  openGraph: {
    title: "Opinext — La voz de la comunidad",
    description: "Listas, puntuaciones y opiniones creadas por personas como vos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ModalProvider>
            {children}
            <AuthModal />
            <CreateModal />
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
