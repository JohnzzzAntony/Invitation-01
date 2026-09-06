import type { Metadata, Viewport } from "next";

/**
 * Root layout required by the Next.js App Router.
 *
 * The real user interface lives in public/*.html (plain HTML/CSS/JS) and is
 * served by the static file handler BEFORE this React shell ever renders —
 * see next.config.ts. This file exists only so that `next dev` and
 * `next build` have a valid app shell; users never see it.
 */
export const metadata: Metadata = {
  title: "Ever RSVP — Beautiful event websites & effortless RSVPs",
  description:
    "Create a stunning event website in minutes. Pure HTML/CSS/JS — no framework on the front end.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8F8F6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
