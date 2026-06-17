import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="site-header">
      <nav className="nav" aria-label="Navigasi utama">
        <Link className="brand" href="/" aria-label="PojokSeken beranda" data-test-id="header-logo-link">
          <Image src="/logo-pojok-seken.svg" alt="PojokSeken" width={252} height={64} priority />
        </Link>
        <div className="nav-links">
          <Link href="/search">Cari Produk</Link>
          <Link href="/users">Cari Penjual</Link>
          <Link href="/contact">Kontak</Link>
          <Link href="/about">Tentang</Link>
          <Link className="button" href="/login" aria-label="Login atau register akun Pojok Seken">
            Masuk / Daftar
          </Link>
        </div>
      </nav>
    </header>
  );
}
