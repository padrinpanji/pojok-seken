import Link from "next/link";
import { formatPrice, type Product } from "@/data/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card" data-test-id={`product-card-${product.id}`}>
      <Link
        href={`/products/${product.slug}`}
        aria-label={`Lihat detail ${product.name}`}
        data-test-id={`product-card-image-link-${product.id}`}
      >
        <img src={product.image} alt={`${product.name} di ${product.location}`} />
      </Link>
      <div className="product-body">
        <div className="product-meta">
          <span>{product.category}</span>
          <span>{product.location}</span>
        </div>
        <h3>
          <Link href={`/products/${product.slug}`} data-test-id={`product-card-title-link-${product.id}`}>
            {product.name}
          </Link>
        </h3>
        <div className="price">{formatPrice(product.price)}</div>
        <div className="badge-row">
          <span className="badge">{product.condition}</span>
          <span className="badge">Tahun {product.year}</span>
        </div>
      </div>
    </article>
  );
}
