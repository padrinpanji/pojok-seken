import type { Metadata } from "next";
import Link from "next/link";
import SchemaScript from "@/components/SchemaScript";
import { siteConfig } from "@/data/products";

export const metadata: Metadata = {
  title: "Login atau Register Akun",
  description:
    "Login atau register akun Pojok Seken untuk menyimpan listing, menghubungi penjual, dan mengelola aktivitas marketplace barang bekas.",
  alternates: {
    canonical: "/login"
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "Login atau Register Akun Pojok Seken",
    description:
      "Masuk atau daftar akun Pojok Seken untuk pengalaman marketplace barang bekas yang lebih mudah.",
    url: `${siteConfig.url}/login`,
    type: "website"
  }
};

export default function LoginPage() {
  const authSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Login atau Register Akun Pojok Seken",
    url: `${siteConfig.url}/login`,
    description:
      "Halaman login dan register untuk pengguna Pojok Seken yang ingin menyimpan listing dan mengelola aktivitas marketplace."
  };

  return (
    <>
      <SchemaScript data={authSchema} />
      <section className="profile-topbar">
        <div className="container breadcrumb">
          <Link href="/">Beranda</Link>
          <span>/</span>
          <span>Login / Register</span>
        </div>
      </section>

      <section className="section">
        <div className="container page-hero">
          <p className="eyebrow">Akun Pojok Seken</p>
          <h1>Login atau register</h1>
          <p>
            Masuk untuk menyimpan listing favorit, menghubungi penjual lebih cepat, dan
            mengelola aktivitas pencarian barang bekas.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/login">
              Login
            </Link>
            <Link className="button secondary" href="/login">
              Register
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
