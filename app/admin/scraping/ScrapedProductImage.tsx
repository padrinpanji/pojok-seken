"use client";

import { useEffect, useState } from "react";

const FALLBACK_IMAGE = "/logo-pojok-seken.svg";

function isBlockedImageSource(src: string) {
  const normalizedSrc = src.toLowerCase();

  return !src || normalizedSrc.includes("favicon") || normalizedSrc.endsWith("/favicon.ico");
}

type ScrapedProductImageProps = {
  alt: string;
  className: string;
  loading?: "eager" | "lazy";
  src: string;
  testId?: string;
};

export default function ScrapedProductImage({
  alt,
  className,
  loading,
  src,
  testId
}: ScrapedProductImageProps) {
  const initialSrc = isBlockedImageSource(src) ? FALLBACK_IMAGE : src;
  const [imageSrc, setImageSrc] = useState(initialSrc);

  useEffect(() => {
    setImageSrc(isBlockedImageSource(src) ? FALLBACK_IMAGE : src);
  }, [src]);

  return (
    <img
      className={className}
      src={imageSrc}
      alt={alt}
      loading={loading}
      onError={() => setImageSrc(FALLBACK_IMAGE)}
      data-test-id={testId}
    />
  );
}
