import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import PrivyProvider from "@/components/provider/privy-provider";
import Footer from "@/components/layout/footer";
import WagmiProviderWrapper from "@/components/provider/wagmi-provider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KUDO",
  description: "The Agentic Covenant Framework",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <PrivyProvider>
          <WagmiProviderWrapper>
            <Navbar />
            {children}
            <Footer />
          </WagmiProviderWrapper>
        </PrivyProvider>
        <Toaster />
      </body>
    </html>
  );
}
