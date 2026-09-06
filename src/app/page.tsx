import { redirect } from "next/navigation";

/**
 * Fallback only. The beforeFiles rewrite in next.config.ts serves
 * public/index.html at "/", so this redirect is never normally reached.
 * It simply keeps the App Router valid (a root page is required).
 */
export default function Home() {
  redirect("/index.html");
}
