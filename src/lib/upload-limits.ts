// Shared by the admin upload route, the product form, and the product save
// action. Raw uploads land under this prefix and are converted to WebP under
// products/ when the product is saved.
export const RAW_UPLOAD_PREFIX = "products/raw/";
export const MAX_RAW_UPLOAD_BYTES = 25 * 1024 * 1024;
// Photos the browser already compressed to a final-size WebP. Saved as-is,
// never re-downloaded or re-encoded by the server.
export const READY_UPLOAD_PREFIX = "products/ready/";
export const MAX_READY_UPLOAD_BYTES = 4 * 1024 * 1024;
