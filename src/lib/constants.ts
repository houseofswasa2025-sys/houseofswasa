export const SITE_NAME = "House of Swasa";
export const SITE_TAGLINE = "Your Style..Your Story";

export const CONTACT = {
  whatsappNumber: "919652282268",
  email: "swathi.pisarla98@gmail.com",
};

export const FABRICS = [
  "Silk",
  "Cotton",
  "Organza",
  "Banarasi",
  "Kanjivaram",
  "Linen",
  "Chiffon",
  "Georgette",
  "Tissue",
] as const;

export const CATEGORIES = [
  "Silk Sarees",
  "Cotton Sarees",
  "Linen Sarees",
  "Banarasi Sarees",
  "Kanjivaram Sarees",
  "Organza Sarees",
  "Chiffon Sarees",
  "Georgette Sarees",
  "Party Wear",
  "Wedding Collection",
  "Handloom Collection",
  "Daily Wear",
] as const;

export const OCCASIONS = [
  "Festive Wear",
  "Party Wear",
  "Office Wear",
  "Casual Wear",
  "Weddings",
] as const;

export const COLORS = [
  "Red",
  "Maroon",
  "Pink",
  "Orange",
  "Yellow",
  "Green",
  "Blue",
  "Purple",
  "Black",
  "White",
  "Cream",
  "Gold",
  "Silver",
  "Multicolor",
] as const;

export function whatsappLink(message: string, number = CONTACT.whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(rupees: number) {
  return `₹${rupees.toLocaleString("en-IN")}`;
}
