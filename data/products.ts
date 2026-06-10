export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  condition: string;
  price: number;
  location: string;
  image: string;
  gallery: string[];
  year: string;
  seller: string;
  description: string;
  highlights: string[];
};

type SearchProductsParams = {
  q?: string;
  category?: string;
  condition?: string;
};

export const siteConfig = {
  name: "Pojok Seken",
  url: "https://pojokseken.example.com",
  description:
    "Pojok Seken adalah marketplace barang bekas berkualitas untuk laptop, kamera, furnitur, sepeda, dan kebutuhan rumah tangga pilihan.",
  city: "Jakarta",
  country: "ID",
  phone: "+62 812-3456-7890",
  email: "halo@pojokseken.id"
};

export const categories = [
  "Elektronik",
  "Kamera",
  "Furnitur",
  "Fashion",
  "Hobi",
  "Kendaraan"
];

export const products: Product[] = [
  {
    id: 1,
    slug: "macbook-air-m1-2020-mulus",
    name: "MacBook Air M1 2020 Mulus",
    category: "Elektronik",
    condition: "Bekas Like New",
    price: 9200000,
    location: "Jakarta Selatan",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=80"
    ],
    year: "2020",
    seller: "Raka Gadget",
    description:
      "MacBook Air M1 RAM 8GB SSD 256GB, baterai sehat, bodi mulus, siap pakai untuk kerja harian, kuliah, dan editing ringan.",
    highlights: ["RAM 8GB", "SSD 256GB", "Baterai sehat", "Fullset charger"]
  },
  {
    id: 2,
    slug: "sony-a6400-kit-lens-16-50mm",
    name: "Sony A6400 Kit Lens 16-50mm",
    category: "Kamera",
    condition: "Bekas Terawat",
    price: 10800000,
    location: "Bandung",
    image:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=1200&q=80"
    ],
    year: "2019",
    seller: "Nara Kamera",
    description:
      "Kamera mirrorless Sony A6400 lengkap dengan kit lens, cocok untuk konten, travel, dan foto produk. Sensor bersih dan autofocus normal.",
    highlights: ["Shutter rendah", "Kit lens", "Tas kamera", "Baterai cadangan"]
  },
  {
    id: 3,
    slug: "sofa-minimalis-abu-3-seater",
    name: "Sofa Minimalis Abu 3 Seater",
    category: "Furnitur",
    condition: "Bekas Bagus",
    price: 1850000,
    location: "Tangerang",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493663284031-b7e3aaa4cab7?auto=format&fit=crop&w=1200&q=80"
    ],
    year: "2023",
    seller: "Rumah Rapi",
    description:
      "Sofa kain abu ukuran 3 seater, busa masih empuk, rangka kokoh, cocok untuk ruang tamu apartemen atau rumah minimalis.",
    highlights: ["3 seater", "Busa empuk", "Rangka kuat", "Siap angkut"]
  },
  {
    id: 4,
    slug: "sepeda-lipat-20-inch-urban",
    name: "Sepeda Lipat 20 Inch Urban",
    category: "Hobi",
    condition: "Bekas Siap Pakai",
    price: 2100000,
    location: "Depok",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80"
    ],
    year: "2022",
    seller: "Gowes Corner",
    description:
      "Sepeda lipat 20 inch untuk komuter kota, ringan, rem pakem, gear normal, dan mudah masuk bagasi mobil.",
    highlights: ["20 inch", "Frame ringan", "Rem normal", "Ban tebal"]
  },
  {
    id: 5,
    slug: "kursi-kerja-ergonomis-hitam",
    name: "Kursi Kerja Ergonomis Hitam",
    category: "Furnitur",
    condition: "Bekas Terawat",
    price: 975000,
    location: "Bekasi",
    image:
      "https://images.unsplash.com/photo-1505843490701-5be5d8b5a1f1?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505843490701-5be5d8b5a1f1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=80"
    ],
    year: "2021",
    seller: "Office Seken",
    description:
      "Kursi kerja ergonomis dengan sandaran mesh, armrest, dan hidrolik normal. Nyaman untuk WFH panjang.",
    highlights: ["Mesh back", "Hidrolik normal", "Armrest", "Roda lancar"]
  },
  {
    id: 6,
    slug: "iphone-13-128gb-midnight",
    name: "iPhone 13 128GB Midnight",
    category: "Elektronik",
    condition: "Bekas Mulus",
    price: 7600000,
    location: "Jakarta Barat",
    image:
      "https://images.unsplash.com/photo-1632633173522-45589163466f?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1632633173522-45589163466f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80"
    ],
    year: "2021",
    seller: "Biru Phone",
    description:
      "iPhone 13 128GB warna Midnight, Face ID normal, kamera jernih, iCloud aman, cocok untuk upgrade harian.",
    highlights: ["128GB", "Face ID normal", "Kamera jernih", "iCloud aman"]
  }
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(price);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function searchProducts({
  q = "",
  category = "",
  condition = ""
}: SearchProductsParams = {}) {
  const normalizedQuery = q.toLowerCase().trim();

  return products.filter((product) => {
    const matchesQuery =
      !normalizedQuery ||
      [product.name, product.category, product.location, product.description]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesCategory = !category || product.category === category;
    const matchesCondition = !condition || product.condition === condition;

    return matchesQuery && matchesCategory && matchesCondition;
  });
}
