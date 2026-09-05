import { redirect } from 'next/navigation'

// The user-facing frontend is a static HTML/CSS/JS app served from /public
// (see public/index.html). The rewrite in next.config.ts maps "/" to
// "/index.html"; this page is only a fallback if the rewrite is bypassed.
export default function Home() {
  redirect('/index.html')
}
