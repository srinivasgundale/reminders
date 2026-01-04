import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as per Premium Aesthetics
import "./globals.css";

const inter = Inter({
  variable: "--font-family-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeNudge | Regret Less",
  description: "A smart personal assistant for high-value, low-frequency reminders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
