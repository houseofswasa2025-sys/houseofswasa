import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "@/components/providers";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} | ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description:
    "House of Swasa is a home-based saree boutique offering Silk, Cotton, Banarasi, Kanjivaram, Organza and festive sarees at affordable prices. Shop online or order via WhatsApp.",
  icons: {
    icon: "/images/icon-192.png",
    apple: "/images/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#7a1f2f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
