import Link from "next/link";
import { SearchIcon } from "@/components/Icons";

export const metadata = {
  title: "Halaman Tidak Ditemukan | Pojok Seken",
  robots: {
    index: false,
    follow: true
  }
};

export default function NotFound() {
  return (
    <section className="section">
      <div className="content">
        <p className="eyebrow">404</p>
        <h1>Halaman tidak ditemukan</h1>
        <p>
          Barang atau halaman yang kamu cari mungkin sudah tidak tersedia. Coba cari
          produk seken lain yang masih aktif di Pojok Seken.
        </p>
        <Link className="button" href="/search">
          <SearchIcon />
          Cari Produk
        </Link>
      </div>
    </section>
  );
}
