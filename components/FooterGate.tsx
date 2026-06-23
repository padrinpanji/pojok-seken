"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

type FooterGateProps = {
  children: ReactNode;
};

export default function FooterGate({ children }: FooterGateProps) {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  return children;
}
