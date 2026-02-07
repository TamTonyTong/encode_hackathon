import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./context/ToastContext";
import { LanguageProvider } from "./context/LanguageContext";
import { RecipeProvider } from "./context/RecipeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aura | AI Meal Planner",
  description: "Experience the future of nutrition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <RecipeProvider>
            <ToastProvider>{children}</ToastProvider>
          </RecipeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
