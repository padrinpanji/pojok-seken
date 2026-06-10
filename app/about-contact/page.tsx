import type { Metadata } from "next";
import SchemaScript from "@/components/SchemaScript";
import { siteConfig } from "@/data/products";

export const metadata: Metadata = {
  title: "About & Contact",
  description:
    "Tentang Pojok Seken dan informasi kontak untuk jual beli barang bekas berkualitas.",
  alternates: {
    canonical: "/about-contact"
  }
};

export default function AboutContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "About & Contact Pojok Seken",
    url: `${siteConfig.url}/about-contact`,
    mainEntity: {
      "@type": "Organization",
      name: siteConfig.name,
      email: siteConfig.email,
      telephone: siteConfig.phone
    }
  };

  return (
    <>
      <SchemaScript data={contactSchema} />
      <article className="content">
        <p className="eyebrow">About & Contact</p>
        <h1>Tentang Pojok Seken</h1>
        <p>
          Pojok Seken dibuat sebagai etalase jual beli barang bekas berkualitas.
          Fokusnya sederhana: produk mudah ditemukan, detail barang jelas, dan calon
          pembeli bisa membandingkan pilihan sebelum menghubungi penjual.
        </p>

        <h2>Kontak</h2>
        <p>
          Untuk demo ini, data kontak menggunakan dummy information. Ganti detail di
          file data ketika situs siap dipakai secara publik.
        </p>

        <div className="contact-grid">
          <div className="contact-item">
            <strong>Email</strong>
            <p>{siteConfig.email}</p>
          </div>
          <div className="contact-item">
            <strong>Telepon</strong>
            <p>{siteConfig.phone}</p>
          </div>
          <div className="contact-item">
            <strong>Lokasi</strong>
            <p>
              {siteConfig.city}, {siteConfig.country}
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
