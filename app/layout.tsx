import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terraço — find and reserve a place",
  description: "Browse listings and place a time-limited hold with a small reservation fee.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
