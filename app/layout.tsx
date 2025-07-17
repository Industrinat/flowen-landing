import { AuthProvider } from '@/hooks/useAuth'
import { TeamProvider } from '@/hooks/useTeam'
// import { TeamsDebug } from '@/components/TeamsDebug' 
import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flowen - Säker fildelning för företag",
  description: "Professionell fildelning med säkerhet i fokus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <TeamProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            {/* <TeamsDebug /> */}
          </TeamProvider>
        </AuthProvider>
      </body>
    </html>
  );
}