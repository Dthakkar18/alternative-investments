export const dynamic = "force-dynamic"; // prevent prerender for all auth pages

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

