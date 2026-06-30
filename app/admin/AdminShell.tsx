import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutSuperadmin } from "@/app/auth/actions";
import { hasSuperadminSession } from "@/lib/superadmin-auth";

type AdminShellProps = {
  activeItem: string;
  children: ReactNode;
};

type AdminNavItem = {
  label: string;
  key: string;
  icon: string;
  href?: string;
};

const adminSections: { label: string; items: AdminNavItem[] }[] = [
  {
    label: "Dashboard",
    items: [{ label: "Overview", key: "overview", icon: "home", href: "/admin" }]
  },
  {
    label: "Users",
    items: [
      { label: "All Users", key: "users", icon: "users" },
      { label: "Sellers", key: "sellers", icon: "users" },
      { label: "Staff", key: "staff", icon: "users" }
    ]
  },
  {
    label: "Catalog",
    items: [
      { label: "Products", key: "products", icon: "box", href: "/admin/products" },
      { label: "Scraping", key: "scraping", icon: "scrape", href: "/admin/scraping" },
      { label: "Categories", key: "categories", icon: "folder", href: "/admin/categories" },
      { label: "Tags", key: "tags", icon: "tag" }
    ]
  },
  {
    label: "Reports",
    items: [
      { label: "Sales Reports", key: "sales-reports", icon: "chart" },
      { label: "System Logs", key: "system-logs", icon: "file" }
    ]
  },
  {
    label: "Settings",
    items: [
      { label: "Platform Settings", key: "platform-settings", icon: "gear" },
      { label: "Roles", key: "roles", icon: "users" }
    ]
  }
];

function AdminIcon({ name }: { name: string }) {
  const icons: Record<string, ReactNode> = {
    home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" />,
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9.5" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    box: (
      <>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </>
    ),
    folder: <path d="M3 6h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" />,
    tag: <path d="M20 13 13 20 4 11V4h7l9 9Z" />,
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-5" />
        <path d="M12 16V8" />
        <path d="M16 16v-3" />
      </>
    ),
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </>
    ),
    gear: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.03.03a2 2 0 1 1-2.83 2.83l-.03-.03A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1 .6 1.8 1.8 0 0 0-.4 1.16V21a2 2 0 1 1-4 0v-.05a1.8 1.8 0 0 0-.4-1.16 1.8 1.8 0 0 0-1-.6 1.8 1.8 0 0 0-1.98.36l-.03.03a2 2 0 1 1-2.83-2.83l.03-.03A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-.6-1 1.8 1.8 0 0 0-1.16-.4H3a2 2 0 1 1 0-4h.05a1.8 1.8 0 0 0 1.16-.4 1.8 1.8 0 0 0 .6-1 1.8 1.8 0 0 0-.36-1.98l-.03-.03a2 2 0 1 1 2.83-2.83l.03.03A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1-.6 1.8 1.8 0 0 0 .4-1.16V3a2 2 0 1 1 4 0v.05a1.8 1.8 0 0 0 .4 1.16 1.8 1.8 0 0 0 1 .6 1.8 1.8 0 0 0 1.98-.36l.03-.03a2 2 0 1 1 2.83 2.83l-.03.03A1.8 1.8 0 0 0 19.4 9a1.8 1.8 0 0 0 .6 1 1.8 1.8 0 0 0 1.16.4H21a2 2 0 1 1 0 4h-.05a1.8 1.8 0 0 0-1.16.4 1.8 1.8 0 0 0-.6 1Z" />
      </>
    ),
    scrape: (
      <>
        <path d="M4 7h16" />
        <path d="M7 7v12" />
        <path d="M17 7v12" />
        <path d="M5 19h14" />
        <path d="M9.5 11h5" />
        <path d="M9.5 15h5" />
        <path d="m16 3 2 4" />
        <path d="M8 3 6 7" />
      </>
    )
  };

  return (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function AdminNavEntry({ item, activeItem }: { item: AdminNavItem; activeItem: string }) {
  const active = item.key === activeItem;
  const className = `flex h-9 min-w-0 items-center gap-2 rounded-lg px-2 text-sm font-semibold transition ${
    active ? "bg-white/14 text-white shadow-inner" : "text-emerald-50/86 hover:bg-white/10 hover:text-white"
  }`;

  if (!item.href) {
    return (
      <span
        className={`${className} opacity-55`}
        data-test-id={`admin-nav-${item.key}`}
        aria-disabled="true"
      >
        <AdminIcon name={item.icon} />
        <span className="truncate">{item.label}</span>
      </span>
    );
  }

  return (
    <Link
      className={`${className} cursor-pointer`}
      href={item.href}
      data-test-id={`admin-nav-${item.key}`}
      aria-current={active ? "page" : undefined}
    >
      <AdminIcon name={item.icon} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export default async function AdminShell({ activeItem, children }: AdminShellProps) {
  if (!(await hasSuperadminSession())) {
    redirect("/auth");
  }

  return (
    <section className="min-h-[calc(100vh-72px)] bg-slate-50" data-test-id="admin-shell">
      <div className="flex min-h-[calc(100vh-72px)] flex-col lg:flex-row">
        <aside
          className="max-h-[360px] shrink-0 overflow-y-auto border-solid border-r border-emerald-950/20 bg-emerald-950 px-3 py-4 text-emerald-50 lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] lg:max-h-none lg:w-52"
          data-test-id="admin-sidebar"
        >
          <p className="px-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300/80">
            Admin Menu
          </p>
          <nav className="mt-4 flex flex-col gap-5" aria-label="Admin navigation" data-test-id="admin-navigation">
            {adminSections.map((section) => (
              <div className="flex flex-col gap-1" key={section.label}>
                <p className="px-2 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-300/90">
                  {section.label}
                </p>
                {section.items.map((item) => (
                  <AdminNavEntry activeItem={activeItem} item={item} key={item.key} />
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8" data-test-id="admin-main">
          {children}
        </main>
      </div>
    </section>
  );
}

export function AdminLogoutButton() {
  return (
    <form action={logoutSuperadmin}>
      <button
        className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-emerald-800 px-4 text-sm font-black text-white shadow-sm transition hover:bg-emerald-900"
        type="submit"
        data-test-id="admin-logout-button"
      >
        Keluar
      </button>
    </form>
  );
}
