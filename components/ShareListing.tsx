"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FacebookIcon, LinkIcon, ShareIcon, TelegramIcon, WhatsAppIcon, XIcon } from "@/components/Icons";

type ShareListingProps = {
  productName: string;
  slug: string;
};

const shareChannels = [
  { label: "WhatsApp", source: "whatsapp", Icon: WhatsAppIcon },
  { label: "Facebook", source: "facebook", Icon: FacebookIcon },
  { label: "X", source: "x", Icon: XIcon },
  { label: "Telegram", source: "telegram", Icon: TelegramIcon }
];

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://pojok-seken.vercel.app").replace(/\/$/, "");

function buildShareUrl(source: string, slug: string, baseUrl: string) {
  const url = new URL(baseUrl);

  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "social_share");
  url.searchParams.set("utm_campaign", "product_listing_share");
  url.searchParams.set("utm_content", slug);

  return url.toString();
}

export default function ShareListing({ productName, slug }: ShareListingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Salin link");
  const [baseUrl, setBaseUrl] = useState(`${siteUrl}/products/${slug}`);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBaseUrl(new URL(window.location.pathname, window.location.origin).toString());
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnOutsideClick(event: MouseEvent) {
      if (!shareRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [isOpen]);

  const shareLinks = useMemo(() => {
    const text = `Lihat listing ${productName} di Pojok Seken`;

    return shareChannels.map((channel) => {
      const shareUrl = buildShareUrl(channel.source, slug, baseUrl);
      const encodedUrl = encodeURIComponent(shareUrl);
      const encodedText = encodeURIComponent(text);
      const hrefBySource: Record<string, string> = {
        whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
      };

      return {
        ...channel,
        href: hrefBySource[channel.source]
      };
    });
  }, [baseUrl, productName, slug]);

  async function copyLink() {
    const shareUrl = buildShareUrl("copy_link", slug, baseUrl);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("Tersalin");
      setIsOpen(false);
      window.setTimeout(() => setCopyStatus("Salin link"), 1800);
    } catch {
      setCopyStatus("Gagal salin");
    }
  }

  return (
    <div className="share-listing" ref={shareRef}>
      <button
        className="share-listing-trigger"
        type="button"
        aria-label="Bagikan listing"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        data-test-id="product-share-trigger"
      >
        <ShareIcon />
      </button>

      {isOpen && (
        <div className="share-popover" role="menu" data-test-id="product-share-popover">
          <strong>Bagikan listing</strong>
          <div className="share-popover-list">
            {shareLinks.map((channel) => (
              <a
                key={channel.source}
                href={channel.href}
                target="_blank"
                rel="noreferrer"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <channel.Icon />
                {channel.label}
              </a>
            ))}
            <button type="button" onClick={copyLink} role="menuitem">
              <LinkIcon />
              {copyStatus}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
