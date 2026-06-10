import Link from "next/link";
import { SearchIcon } from "@/components/Icons";

export default function Header() {
  return (
    <header className="site-header">
      <nav className="nav" aria-label="Navigasi utama">
        <Link className="brand" href="/">
          Pojok <span>Seken</span>
        </Link>
        <div className="nav-links">
          <Link href="/search">Cari Barang</Link>
          <Link href="/about">Tentang</Link>
          <Link href="/contact">Kontak</Link>
          <Link href="/terms-and-conditions">Syarat</Link>
          <Link className="button" href="/search" aria-label="Cari barang bekas di Pojok Seken">
            <SearchIcon />
            Cari
          </Link>
        </div>
      </nav>
    </header>
  );
}
