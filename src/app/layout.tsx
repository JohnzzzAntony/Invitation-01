import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Online RSVP — Beautiful event websites & effortless RSVPs",
  description:
    "Create a stunning event website in minutes and manage every guest from one simple dashboard. Invitations, RSVP management, QR codes, analytics and more.",
  keywords: ["RSVP", "event website", "wedding website", "invitations", "guest management", "event planning"],
  authors: [{ name: "Online RSVP" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Online RSVP — Create your perfect event website",
    description: "Beautiful invitations. Easy RSVPs. Happy guests.",
    siteName: "Online RSVP",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8F8F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
