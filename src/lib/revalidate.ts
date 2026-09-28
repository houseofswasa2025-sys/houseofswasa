import { revalidatePath } from "next/cache";

// Storefront pages are statically cached (ISR). Anything that changes what a
// shopper sees (products, stock, prices, approved reviews, settings) must
// call this so every cached page, including the home page and category
// pages, is rebuilt on its next visit.
export function revalidateStorefront() {
  revalidatePath("/", "layout");
}
