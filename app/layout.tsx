import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "JainRasoi — Jain Vegetarian Recipes",
  description: "Community-driven Jain recipe platform with filtering for Upvas, Paryushan, and no root vegetable diets.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-stone-50 text-gray-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 text-center text-sm text-gray-400 py-6">
          © {new Date().getFullYear()} JainRasoi — Ahimsa in every bite 🙏
        </footer>
      </body>
    </html>
  );
}
