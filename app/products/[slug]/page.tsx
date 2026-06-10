import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SchemaScript from "@/components/SchemaScript";
import ProductCard from "@/components/ProductCard";
import { formatPrice, getProductBySlug, products, siteConfig } from "@/data/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan"
    };
  }

  return {
    title: `${product.name} ${product.condition}`,
    description: `${product.name} di ${product.location}. ${product.description}`,
    alternates: {
      canonical: `/products/${product.slug}`
    },
    openGraph: {
      type: "article",
      title: `${product.name} di Pojok Seken`,
      description: product.description,
      images: [
        {
          url: product.image,
          width: 1200,
          height: 900,
          alt: product.name
        }
      ]
    }
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, 3);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery,
    description: product.description,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: siteConfig.name
    },
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/products/${product.slug}`,
      priceCurrency: "IDR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      seller: {
        "@type": "Organization",
        name: product.seller
      }
    }
  };

  return (
    <>
      <SchemaScript data={productSchema} />
      <section className="section">
        <div className="container detail-layout">
          <div className="gallery">
            {product.gallery.map((image) => (
              <img key={image} src={image} alt={`${product.name} - foto produk`} />
            ))}
          </div>

          <aside className="detail-panel" aria-label="Ringkasan produk">
            <p className="eyebrow">{product.category}</p>
            <h1>{product.name}</h1>
            <div className="price">{formatPrice(product.price)}</div>
            <div className="badge-row">
              <span className="badge">{product.condition}</span>
              <span className="badge">{product.location}</span>
              <span className="badge">Tahun {product.year}</span>
            </div>
            <p>{product.description}</p>
            <Link className="button" href="/contact">
              Hubungi Penjual
            </Link>

            <div className="seller-box">
              <strong>Penjual</strong>
              <p>{product.seller}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Detail barang</p>
              <h2>Informasi utama sebelum cek unit</h2>
            </div>
          </div>
          <div className="spec-list">
            {product.highlights.map((highlight) => (
              <div className="spec" key={highlight}>
                <strong>{highlight}</strong>
                <span>Sudah dicatat oleh penjual untuk membantu perbandingan.</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">Produk serupa</p>
                <h2>Masih dalam kategori {product.category}</h2>
              </div>
            </div>
            <div className="grid">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
