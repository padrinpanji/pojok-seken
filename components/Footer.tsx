import Link from "next/link";
import { siteConfig } from "@/data/products";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <strong>{siteConfig.name}</strong>
        <nav className="nav-links" aria-label="Navigasi footer">
          <Link href="/search">Search</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms-and-conditions">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
