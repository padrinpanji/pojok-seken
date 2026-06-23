import type { Metadata } from "next";
import AdminShell, { AdminLogoutButton } from "@/app/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminPage() {
  return (
    <AdminShell activeItem="overview">
      <div className="flex max-w-5xl flex-wrap gap-4">
        <section
          className="min-h-44 w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:w-[280px]"
          data-test-id="admin-dashboard-card"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">Pojok Seken</p>
          <div className="mt-3 flex items-start justify-between gap-5">
            <div>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-950">Superadmin Dashboard</h1>
              <p className="mt-3 max-w-48 text-sm font-medium leading-6 text-slate-600">
                Anda berhasil masuk sebagai superadmin. Panel pengelolaan akan ditambahkan di sini.
              </p>
            </div>
            <AdminLogoutButton />
          </div>
        </section>

        <section
          className="min-h-44 w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:w-36"
          data-test-id="admin-status-card"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Status</p>
          <p className="mt-3 text-xl font-black text-emerald-800">Active</p>
        </section>

        <section
          className="min-h-44 w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:w-36"
          data-test-id="admin-role-card"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Role</p>
          <p className="mt-3 text-xl font-black text-slate-950">Superadmin</p>
        </section>

        <section
          className="min-h-44 w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:w-36"
          data-test-id="admin-access-card"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Akses</p>
          <p className="mt-3 text-xl font-black text-slate-950">Internal</p>
        </section>
      </div>
    </AdminShell>
  );
}
