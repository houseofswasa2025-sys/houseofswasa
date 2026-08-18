import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin | House of Swasa",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Swasa Admin" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} min-h-screen bg-ivory font-[var(--font-inter)] antialiased`}>
      <PwaRegister />
      {children}
    </div>
  );
}
