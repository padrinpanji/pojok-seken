"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/Icons";

type ProductGalleryProps = {
  images: string[];
  fallbackImage: string;
  productName: string;
};

export default function ProductGallery({ images, fallbackImage, productName }: ProductGalleryProps) {
  const galleryImages = images.length > 0 ? images : [fallbackImage];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] || fallbackImage;

  return (
    <>
      <div className="detail-main-image">
        <img src={activeImage} alt={`${productName} - foto produk utama ${activeIndex + 1}`} />
        <span className="verified-ribbon" data-test-id="product-verified-ribbon">
          <span className="verified-ribbon-icon" aria-hidden="true">
            <CheckIcon />
          </span>
          Unit Terverikasi
        </span>
        <span className="image-counter">
          Foto {activeIndex + 1} dari {galleryImages.length}
        </span>
      </div>
      <div className="detail-thumbs" data-test-id="product-gallery-thumbnails">
        {galleryImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            className={index === activeIndex ? "active" : undefined}
            type="button"
            aria-label={`Tampilkan foto produk ${index + 1}`}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          >
            <img
              src={image}
              alt={`${productName} - foto produk ${index + 1}`}
            />
          </button>
        ))}
      </div>
    </>
  );
}
