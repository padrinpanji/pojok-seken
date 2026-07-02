"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutSuperadmin } from "@/app/auth/actions";

export default function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <details className="account-menu" onToggle={(event) => setIsOpen(event.currentTarget.open)} open={isOpen} ref={menuRef}>
      <summary aria-expanded={isOpen} aria-label="Menu akun Superadmin">
        <span className="account-avatar" aria-hidden="true">
          S
        </span>
        <span className="account-name">Superadmin</span>
      </summary>
      <div className="account-dropdown">
        <Link href="/admin" onClick={() => setIsOpen(false)}>
          Dashboard
        </Link>
        <form action={logoutSuperadmin}>
          <button onClick={() => setIsOpen(false)} type="submit">
            Logout
          </button>
        </form>
      </div>
    </details>
  );
}
