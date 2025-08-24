import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function InvestorLayout({ children }: { children: ReactNode }) {
  const me = await getSessionUser();

  // Not logged in? Send to sign-in with a return path.
  if (!me) redirect(`/sign-in?redirect=${encodeURIComponent("/portfolio")}`);

  // You could pass `me` via context/provider if you want it in children.
  return <>{children}</>;
}

