import type { Metadata } from "next";
import { siteConfig } from "@/data/products";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Syarat dan ketentuan penggunaan Pojok Seken untuk listing dan pencarian barang bekas.",
  alternates: {
    canonical: "/terms"
  }
};

export default function TermsPage() {
  return (
    <article className="content">
      <p className="eyebrow">Terms and Conditions</p>
      <h1>Syarat dan Ketentuan</h1>
      <p>
        Dengan menggunakan {siteConfig.name}, pengguna setuju untuk membaca detail
        produk, memverifikasi kondisi barang, dan melakukan transaksi dengan bijak.
      </p>

      <h2>Listing Produk</h2>
      <ul>
        <li>Informasi produk harus ditulis jelas, akurat, dan tidak menyesatkan.</li>
        <li>Foto produk sebaiknya memperlihatkan kondisi asli barang.</li>
        <li>Harga, lokasi, kondisi, dan kelengkapan barang harus mudah dipahami.</li>
      </ul>

      <h2>Transaksi</h2>
      <ul>
        <li>Pembeli dianjurkan melakukan pengecekan barang sebelum pembayaran.</li>
        <li>Pojok Seken tidak menyimpan pembayaran pada versi dummy ini.</li>
        <li>Kesepakatan pengiriman, garansi personal, dan retur dilakukan antar pengguna.</li>
      </ul>

      <h2>Privasi</h2>
      <p>
        Informasi kontak pada demo ini adalah data dummy. Untuk produksi, tambahkan
        kebijakan privasi lengkap sesuai kebutuhan bisnis dan aturan yang berlaku.
      </p>
    </article>
  );
}
