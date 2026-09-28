// Shared by the admin upload route, the product form, and the product save
// action. Raw uploads land under this prefix and are converted to WebP under
// products/ when the product is saved.
export const RAW_UPLOAD_PREFIX = "products/raw/";
export const MAX_RAW_UPLOAD_BYTES = 25 * 1024 * 1024;
