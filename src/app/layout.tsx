import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TicketHub | Enterprise SaaS Ticketing",
  description: "Create, sell, and scan tickets seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full text-slate-900`}
      >
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
};