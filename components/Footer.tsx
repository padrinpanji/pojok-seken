import Link from "next/link";
import FooterGate from "@/components/FooterGate";
import { siteConfig } from "@/data/products";

export default function Footer() {
  const cities = ["Jakarta", "Bandung", "Bekasi", "Tangerang"];

  return (
    <FooterGate>
      <footer className="footer" data-test-id="site-footer">
        <div className="container footer-inner">
          <div className="footer-main">
            <section className="footer-brand" data-test-id="footer-brand">
              <Link className="footer-logo" href="/" data-test-id="footer-logo-link">
                Pojok<span>Seken</span>
              </Link>
              <p>
                Platform pencarian barang second-hand terverifikasi di Indonesia.
                Menghubungkan pembeli dan penjual secara langsung dan aman.
              </p>
            </section>

            <nav className="footer-column" aria-label="Navigasi utama footer" data-test-id="footer-main-navigation">
              <h2>Navigasi Utama</h2>
              <Link href="/search" data-test-id="footer-search-link">
                Cari Barang Bekas
              </Link>
              <Link href="/about" data-test-id="footer-about-link">
                Tentang Pojok Seken
              </Link>
              <Link href="/contact" data-test-id="footer-contact-link">
                Hubungi Kami
              </Link>
            </nav>

            <nav className="footer-column" aria-label="Kebijakan footer" data-test-id="footer-policy-navigation">
              <h2>Kebijakan</h2>
              <Link href="/terms-and-conditions" data-test-id="footer-terms-link">
                Syarat & Ketentuan
              </Link>
              <Link href="/terms" data-test-id="footer-privacy-link">
                Kebijakan Privasi
              </Link>
              <Link href="/term-and-condition" data-test-id="footer-safety-link">
                Panduan Keamanan COD
              </Link>
            </nav>

            <section className="footer-column footer-contact" data-test-id="footer-contact">
              <h2>Hubungi Kami</h2>
              <p>Punya pertanyaan seputar cara pasang iklan?</p>
              <a href={`mailto:${siteConfig.email}`} data-test-id="footer-email-link">
                info.pojokseken@gmail.com
              </a>
            </section>
          </div>

          <div className="footer-bottom" data-test-id="footer-bottom">
            <p>&copy; 2026 Pojok Seken Indonesia. Seluruh Hak Cipta Dilindungi.</p>
            <nav aria-label="Kota populer" data-test-id="footer-city-links">
              {cities.map((city, index) => (
                <span key={city}>
                  <Link
                    href={`/search?location=${encodeURIComponent(city)}`}
                    data-test-id={`footer-city-${city.toLowerCase()}`}
                  >
                    {city}
                  </Link>
                  {index < cities.length - 1 ? <i aria-hidden="true">&bull;</i> : null}
                </span>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </FooterGate>
  );
}
