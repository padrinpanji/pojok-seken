import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import SchemaScript from "@/components/SchemaScript";
import { siteConfig } from "@/data/products";

export const metadata: Metadata = {
  title: "Login atau Register Akun",
  description:
    "Login atau register akun Pojok Seken untuk menyimpan listing, menghubungi penjual, dan mengelola aktivitas marketplace barang bekas.",
  alternates: {
    canonical: "/auth"
  },
  robots: {
    index: false,
    follow: true
  },
  openGraph: {
    title: "Login atau Register Akun Pojok Seken",
    description:
      "Masuk atau daftar akun Pojok Seken untuk pengalaman marketplace barang bekas yang lebih mudah.",
    url: `${siteConfig.url}/auth`,
    type: "website"
  }
};

const authFeatures = [
  {
    title: "Favorit tersinkron",
    text: "Simpan barang pilihan Anda dan pantau perubahannya kapan saja.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
      />
    )
  },
  {
    title: "Hubungi penjual instan",
    text: "Kirim pesan langsung ke WhatsApp penjual terverifikasi tanpa ribet.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.277 3.423.335a11.14 11.14 0 0 0 3.036-.316c1.554-.315 2.75-1.56 2.75-3.18V8.25c0-1.62-1.196-2.865-2.75-3.18a11.123 11.123 0 0 0-3.036-.317 11.18 11.18 0 0 0-3.422.335M3.75 12.75V15.75c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 0 3.375-3.375V11.25"
      />
    )
  },
  {
    title: "Transaksi aman & terpercaya",
    text: "Sistem review dan profil verified menjaga pengalaman jual beli Anda.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
      />
    )
  }
];

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg className="auth-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      {children}
    </svg>
  );
}

export default function AuthPage() {
  const authSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Login atau Register Akun Pojok Seken",
    url: `${siteConfig.url}/auth`,
    description:
      "Halaman login dan register untuk pengguna Pojok Seken yang ingin menyimpan listing dan mengelola aktivitas marketplace."
  };

  return (
    <>
      <SchemaScript data={authSchema} />
      <section className="auth-page">
        <div className="container auth-shell">
          <nav className="breadcrumb auth-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Beranda</Link>
            <span>/</span>
            <span>Login / Register</span>
          </nav>

          <div className="auth-card">
            <aside className="auth-promo">
              <div className="auth-promo-art" aria-hidden="true" />
              <div className="auth-promo-content">
                <span className="auth-pill">
                  <span />
                  Akun Pojok Seken
                </span>
                <h1>
                  Mulai langkah baru di <strong>PojokSeken</strong>
                </h1>
                <p>
                  Masuk untuk menyimpan listing favorit, menghubungi penjual lebih cepat, dan
                  mengelola aktivitas pencarian barang bekas berkualitas.
                </p>
              </div>

              <div className="auth-feature-list">
                {authFeatures.map((feature) => (
                  <div className="auth-feature" key={feature.title}>
                    <span className="auth-feature-icon">
                      <Icon>{feature.icon}</Icon>
                    </span>
                    <span>
                      <strong>{feature.title}</strong>
                      <small>{feature.text}</small>
                    </span>
                  </div>
                ))}
              </div>
            </aside>

            <div className="auth-panel">
              <input className="auth-tab-input" type="radio" name="auth-tab" id="auth-login" defaultChecked />
              <input className="auth-tab-input" type="radio" name="auth-tab" id="auth-register" />

              <div className="auth-tabs" role="tablist" aria-label="Pilih mode autentikasi">
                <label className="auth-tab auth-tab-login" htmlFor="auth-login">
                  Masuk Akun
                </label>
                <label className="auth-tab auth-tab-register" htmlFor="auth-register">
                  Daftar Baru
                </label>
              </div>

              <div className="auth-form-stage">
                <form className="auth-form auth-login-form">
                  <div className="auth-form-head">
                    <h2>Selamat datang kembali!</h2>
                    <p>Silakan masuk dengan kredensial terdaftar Anda.</p>
                  </div>

                  <label className="auth-field">
                    <span>Alamat Email atau WhatsApp</span>
                    <input type="text" name="loginEmail" placeholder="contoh@email.com / 0812345..." required />
                  </label>

                  <label className="auth-field">
                    <span className="auth-field-row">
                      Kata Sandi
                      <Link href="/auth">Lupa Kata Sandi?</Link>
                    </span>
                    <input type="password" name="loginPassword" placeholder="Masukkan kata sandi Anda" required />
                  </label>

                  <label className="auth-check">
                    <input type="checkbox" name="rememberMe" />
                    <span>Ingat sesi saya di browser ini</span>
                  </label>

                  <button className="auth-submit" type="submit">
                    <span>Masuk Sekarang</span>
                    <Icon>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </Icon>
                  </button>

                </form>

                <form className="auth-form auth-register-form">
                  <div className="auth-form-head">
                    <h2>Buat akun PojokSeken</h2>
                    <p>Mulai bergabung dalam pasar barang bekas terbaik di Indonesia.</p>
                  </div>

                  <label className="auth-field">
                    <span>Nama Lengkap</span>
                    <input type="text" name="name" placeholder="Contoh: Budi Santoso" disabled />
                  </label>

                  <label className="auth-field">
                    <span>Alamat Email</span>
                    <input type="email" name="email" placeholder="contoh@email.com" disabled />
                  </label>

                  <label className="auth-field">
                    <span>Nomor WhatsApp</span>
                    <span className="auth-phone-field">
                      <strong>+62</strong>
                      <input type="tel" name="phone" placeholder="8123456789" disabled />
                    </span>
                  </label>

                  <label className="auth-field">
                    <span>Buat Kata Sandi</span>
                    <input type="password" name="password" placeholder="Minimal 8 karakter" disabled />
                  </label>

                  <div className="auth-strength" aria-hidden="true">
                    <span>
                      Kekuatan Sandi: <strong>Sangat Lemah</strong>
                    </span>
                    <i />
                  </div>

                  <label className="auth-check">
                    <input type="checkbox" name="terms" disabled />
                    <span>
                      Saya setuju dengan <Link href="/terms-and-conditions">Ketentuan Layanan</Link> dan{" "}
                      <Link href="/terms">Kebijakan Privasi</Link> PojokSeken.
                    </span>
                  </label>

                  <button className="auth-submit" type="submit" disabled>
                    <span>Daftar Sekarang</span>
                    <Icon>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </Icon>
                  </button>

                  <div className="auth-coming-soon" aria-live="polite">
                    <span className="auth-coming-soon-icon" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M8.25 13.5h3.75m-3.75 3h2.25m3.75-3h1.5m-12-5.25v10.5A2.25 2.25 0 0 0 6 21h7.5m6.75-12.75v4.5m-3 4.5 1.5 1.5 2.25-3" />
                      </svg>
                    </span>
                    <strong>Daftar akun segera hadir</strong>
                    <span>Untuk saat ini, fitur registrasi PojokSeken sedang kami siapkan.</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
