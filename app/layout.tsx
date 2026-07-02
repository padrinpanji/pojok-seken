import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NavigationProgress from "@/components/NavigationProgress";
import SchemaScript from "@/components/SchemaScript";
import { siteConfig } from "@/data/products";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Pojok Seken | Marketplace Barang Bekas Berkualitas",
    template: "%s | Pojok Seken"
  },
  description: siteConfig.description,
  keywords: [
    "barang bekas",
    "jual beli barang bekas",
    "marketplace barang seken",
    "produk bekas berkualitas",
    "Pojok Seken"
  ],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml"
      }
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Pojok Seken | Marketplace Barang Bekas Berkualitas",
    description: siteConfig.description,
    images: [
      {
        url: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Pilihan barang bekas berkualitas di Pojok Seken"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Pojok Seken | Marketplace Barang Bekas Berkualitas",
    description: siteConfig.description
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.city,
      addressCountry: siteConfig.country
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="id">
      <body>
        <SchemaScript data={[organizationSchema, websiteSchema]} />
        <NavigationProgress />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
