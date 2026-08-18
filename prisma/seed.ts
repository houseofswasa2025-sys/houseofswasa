import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Placeholder photos are generated locally (public/images/placeholders) instead of
// fetched from picsum.photos — picsum can't reliably serve ~20 distinct images under
// the concurrent load of an admin page loading every product's thumbnail at once.
function img(seed: string) {
  return seed;
}

function placeholderFor(fabric: string) {
  return `/images/placeholders/${fabric.toLowerCase()}.jpg`;
}

const products = [
  {
    name: "Kanjivaram Silk Saree - Royal Maroon",
    description:
      "A timeless Kanjivaram silk saree in royal maroon with a rich gold zari border, perfect for weddings and festive occasions.",
    type: "SAREE" as const,
    price: 8500,
    salePrice: null,
    images: [img("kanjivaram-maroon-1"), img("kanjivaram-maroon-2")],
    colors: ["Maroon", "Gold"],
    fabric: "Kanjivaram",
    categories: ["Kanjivaram Sarees", "Wedding Collection"],
    occasions: ["Weddings", "Festive Wear"],
    stock: 6,
    isNewArrival: true,
    isBestSeller: true,
    isOnSale: false,
  },
  {
    name: "Banarasi Silk Saree - Emerald Green",
    description: "Handwoven Banarasi silk saree in emerald green with intricate zari weaving, ideal for festive celebrations.",
    type: "SAREE" as const,
    price: 7200,
    salePrice: 6200,
    images: [img("banarasi-green-1"), img("banarasi-green-2")],
    colors: ["Green", "Gold"],
    fabric: "Banarasi",
    categories: ["Banarasi Sarees", "Wedding Collection"],
    occasions: ["Weddings", "Festive Wear"],
    stock: 4,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
  },
  {
    name: "Mysore Silk Saree - Classic Pink",
    description: "Lightweight Mysore silk saree in classic pink, elegant for both office wear and evening gatherings.",
    type: "SAREE" as const,
    price: 4200,
    salePrice: null,
    images: [img("mysore-pink-1")],
    colors: ["Pink"],
    fabric: "Silk",
    categories: ["Silk Sarees", "Office Wear"],
    occasions: ["Office Wear", "Party Wear"],
    stock: 10,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
  },
  {
    name: "Handloom Cotton Saree - Indigo Blue",
    description: "Soft handloom cotton saree in indigo blue with a contrast border, perfect for daily elegance.",
    type: "SAREE" as const,
    price: 1450,
    salePrice: null,
    images: [img("cotton-indigo-1"), img("cotton-indigo-2")],
    colors: ["Blue"],
    fabric: "Cotton",
    categories: ["Cotton Sarees", "Handloom Collection", "Daily Wear"],
    occasions: ["Casual Wear", "Office Wear"],
    stock: 15,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
  },
  {
    name: "Mul Cotton Saree - Ivory & Rust",
    description: "Breathable mul cotton saree in ivory with rust hand-block prints, great for everyday wear.",
    type: "SAREE" as const,
    price: 1650,
    salePrice: 1350,
    images: [img("mulcotton-ivory-1")],
    colors: ["Cream", "Orange"],
    fabric: "Cotton",
    categories: ["Cotton Sarees", "Daily Wear"],
    occasions: ["Casual Wear"],
    stock: 12,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: true,
  },
  {
    name: "Organza Saree - Blush Pink Floral",
    description: "Sheer organza saree with delicate floral embroidery in blush pink, perfect for parties.",
    type: "SAREE" as const,
    price: 3800,
    salePrice: null,
    images: [img("organza-blush-1"), img("organza-blush-2")],
    colors: ["Pink"],
    fabric: "Organza",
    categories: ["Organza Sarees", "Party Wear"],
    occasions: ["Party Wear", "Festive Wear"],
    stock: 8,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
  },
  {
    name: "Organza Saree - Sea Green Sequins",
    description: "Lightweight sequinned organza saree in sea green, designed to make a statement at any celebration.",
    type: "SAREE" as const,
    price: 4100,
    salePrice: null,
    images: [img("organza-seagreen-1")],
    colors: ["Green"],
    fabric: "Organza",
    categories: ["Organza Sarees", "Party Wear"],
    occasions: ["Party Wear"],
    stock: 0,
    isNewArrival: false,
    isBestSeller: false,
    isOnSale: false,
  },
  {
    name: "Linen Saree - Sunflower Yellow",
    description: "Pure linen saree in sunflower yellow with a woven border, breathable and elegant for daily wear.",
    type: "SAREE" as const,
    price: 2600,
    salePrice: null,
    images: [img("linen-yellow-1")],
    colors: ["Yellow"],
    fabric: "Linen",
    categories: ["Linen Sarees", "Daily Wear"],
    occasions: ["Casual Wear", "Office Wear"],
    stock: 9,
    isNewArrival: false,
    isBestSeller: false,
    isOnSale: false,
  },
  {
    name: "Linen Saree - Charcoal Grey",
    description: "Sophisticated linen saree in charcoal grey, tailored for the modern working woman.",
    type: "SAREE" as const,
    price: 2750,
    salePrice: 2350,
    images: [img("linen-grey-1"), img("linen-grey-2")],
    colors: ["Black"],
    fabric: "Linen",
    categories: ["Linen Sarees", "Office Wear"],
    occasions: ["Office Wear"],
    stock: 7,
    isNewArrival: false,
    isBestSeller: false,
    isOnSale: true,
  },
  {
    name: "Chiffon Saree - Wine Ombre",
    description: "Flowy chiffon saree with a wine to blush ombre effect, perfect for evening parties.",
    type: "SAREE" as const,
    price: 2200,
    salePrice: null,
    images: [img("chiffon-wine-1")],
    colors: ["Maroon", "Pink"],
    fabric: "Chiffon",
    categories: ["Chiffon Sarees", "Party Wear"],
    occasions: ["Party Wear"],
    stock: 11,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
  },
  {
    name: "Georgette Saree - Royal Blue Embellished",
    description: "Elegant georgette saree in royal blue with stone embellishments along the border.",
    type: "SAREE" as const,
    price: 3200,
    salePrice: null,
    images: [img("georgette-blue-1"), img("georgette-blue-2")],
    colors: ["Blue"],
    fabric: "Georgette",
    categories: ["Georgette Sarees", "Party Wear"],
    occasions: ["Party Wear", "Festive Wear"],
    stock: 5,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
  },
  {
    name: "Tissue Silk Saree - Peacock Teal",
    description: "Shimmering tissue silk saree in peacock teal, festive and radiant.",
    type: "SAREE" as const,
    price: 5200,
    salePrice: 4600,
    images: [img("tissue-teal-1")],
    colors: ["Blue", "Green"],
    fabric: "Tissue",
    categories: ["Silk Sarees", "Wedding Collection"],
    occasions: ["Weddings", "Festive Wear"],
    stock: 3,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: true,
  },
  {
    name: "Banarasi Silk Saree - Bridal Red",
    description: "Opulent bridal red Banarasi silk saree with heavy zari border and pallu, made for weddings.",
    type: "SAREE" as const,
    price: 12500,
    salePrice: null,
    images: [img("banarasi-red-1"), img("banarasi-red-2")],
    colors: ["Red", "Gold"],
    fabric: "Banarasi",
    categories: ["Banarasi Sarees", "Wedding Collection"],
    occasions: ["Weddings"],
    stock: 2,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
  },
  {
    name: "Soft Silk Saree - Lavender Purple",
    description: "Soft silk saree in lavender purple with a contrast pallu, versatile for festive and party wear.",
    type: "SAREE" as const,
    price: 3600,
    salePrice: null,
    images: [img("softsilk-lavender-1")],
    colors: ["Purple"],
    fabric: "Silk",
    categories: ["Silk Sarees", "Party Wear"],
    occasions: ["Party Wear", "Festive Wear"],
    stock: 8,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
  },
  {
    name: "Cotton Handloom Saree - Black & White Ikat",
    description: "Handwoven Ikat cotton saree in a striking black and white pattern, a daily wear favourite.",
    type: "SAREE" as const,
    price: 1950,
    salePrice: null,
    images: [img("ikat-blackwhite-1"), img("ikat-blackwhite-2")],
    colors: ["Black", "White"],
    fabric: "Cotton",
    categories: ["Cotton Sarees", "Handloom Collection"],
    occasions: ["Casual Wear", "Office Wear"],
    stock: 10,
    isNewArrival: false,
    isBestSeller: false,
    isOnSale: false,
  },
  {
    name: "Kanjivaram Silk Saree - Temple Border Mustard",
    description: "Traditional Kanjivaram silk saree in mustard with a temple-design gold border.",
    type: "SAREE" as const,
    price: 9200,
    salePrice: 8200,
    images: [img("kanjivaram-mustard-1")],
    colors: ["Yellow", "Gold"],
    fabric: "Kanjivaram",
    categories: ["Kanjivaram Sarees", "Wedding Collection"],
    occasions: ["Weddings", "Festive Wear"],
    stock: 4,
    isNewArrival: false,
    isBestSeller: false,
    isOnSale: true,
  },
  {
    name: "Chanderi Silk Cotton Dress Material - Peach Floral",
    description: "Unstitched Chanderi silk cotton dress material with peach floral prints, includes top, bottom and dupatta.",
    type: "DRESS_MATERIAL" as const,
    price: 1850,
    salePrice: null,
    images: [img("dress-peach-1"), img("dress-peach-2")],
    colors: ["Orange", "Cream"],
    fabric: "Cotton",
    categories: ["Daily Wear"],
    occasions: ["Casual Wear", "Office Wear"],
    stock: 14,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
  },
  {
    name: "Silk Dress Material - Festive Maroon Embroidered",
    description: "Unstitched silk dress material set with maroon embroidery, festive and celebration ready.",
    type: "DRESS_MATERIAL" as const,
    price: 3200,
    salePrice: 2800,
    images: [img("dress-maroon-1")],
    colors: ["Maroon"],
    fabric: "Silk",
    categories: ["Party Wear"],
    occasions: ["Festive Wear", "Party Wear"],
    stock: 6,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
  },
  {
    name: "Cotton Dress Material - Mint Green Printed",
    description: "Breathable pure cotton dress material in mint green with block prints, includes dupatta.",
    type: "DRESS_MATERIAL" as const,
    price: 1250,
    salePrice: null,
    images: [img("dress-mint-1")],
    colors: ["Green"],
    fabric: "Cotton",
    categories: ["Daily Wear"],
    occasions: ["Casual Wear"],
    stock: 20,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
  },
  {
    name: "Georgette Dress Material - Navy Party Wear",
    description: "Georgette dress material in navy with sequin work, perfect for evening parties and get-togethers.",
    type: "DRESS_MATERIAL" as const,
    price: 2400,
    salePrice: null,
    images: [img("dress-navy-1"), img("dress-navy-2")],
    colors: ["Blue"],
    fabric: "Georgette",
    categories: ["Party Wear"],
    occasions: ["Party Wear"],
    stock: 0,
    isNewArrival: false,
    isBestSeller: false,
    isOnSale: false,
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const reviews = [
  {
    name: "Priya Sharma",
    rating: 5,
    text: "The saree quality exceeded my expectations. Beautiful fabric and quick delivery.",
    approved: true,
  },
  {
    name: "Lakshmi Narayan",
    rating: 5,
    text: "Absolutely loved the Kanjivaram I ordered for my sister's wedding. Will definitely order again!",
    approved: true,
  },
  {
    name: "Ananya Reddy",
    rating: 4,
    text: "Great collection and very responsive on WhatsApp. Packaging was neat too.",
    approved: true,
  },
];

async function main() {
  console.log("Seeding site settings...");
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      whatsappNumber: "919652282268",
      contactEmail: "swathi.pisarla98@gmail.com",
    },
  });

  console.log("Seeding admin user...");
  const adminPhone = "9652282268";
  const adminEmail = "houseofswasa2025@gmail.com";
  const adminPassword = "Swasa@0406";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { email: adminEmail, passwordHash, role: "ADMIN" },
    create: {
      name: "House of Swasa Admin",
      phone: adminPhone,
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seeding products...");
  for (const p of products) {
    const slug = slugify(p.name);
    const images = [placeholderFor(p.fabric)];
    await prisma.product.upsert({
      where: { slug },
      update: { images },
      create: { ...p, slug, images },
    });
  }

  console.log("Seeding reviews...");
  for (const r of reviews) {
    const existing = await prisma.review.findFirst({ where: { name: r.name, text: r.text } });
    if (!existing) {
      await prisma.review.create({ data: r });
    }
  }

  console.log("Done.");
  console.log(`Admin login -> email: ${adminEmail} (or phone: ${adminPhone}), password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
