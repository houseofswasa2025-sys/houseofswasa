import { Resend } from "resend";
import { formatPrice } from "@/lib/constants";
import { getSiteSettings } from "@/lib/site-settings";
import type { Order, OrderItem, OrderStatus } from "@/generated/prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "House of Swasa <orders@houseofswasa.com>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://house-of-swasa-xi.vercel.app";

type OrderWithItems = Order & { items: OrderItem[] };

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const LOGO_URL = `${SITE_URL}/images/logo-mark.png`;

function layout(title: string, bodyHtml: string) {
  return `
  <div style="font-family:Georgia,'Times New Roman',serif;background:#fffbf5;padding:32px 16px;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #f7f1e6;border-radius:12px;overflow:hidden;">
      <div style="background:#7a1f2f;padding:20px 28px;display:flex;align-items:center;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;padding-right:10px;">
              <img src="${LOGO_URL}" width="32" height="32" alt="House of Swasa" style="display:block;border-radius:6px;" />
            </td>
            <td style="vertical-align:middle;">
              <span style="color:#e8d9a8;font-size:20px;font-weight:600;letter-spacing:0.02em;">House of Swasa</span>
            </td>
          </tr>
        </table>
      </div>
      <div style="padding:28px;color:#2a1a1f;">
        <h1 style="margin:0 0 16px;font-size:20px;color:#7a1f2f;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:16px 28px;background:#f7f1e6;color:#8a7a6a;font-size:12px;">
        House of Swasa &middot; Your Style..Your Story
      </div>
    </div>
  </div>`;
}

function itemsTable(items: OrderItem[]) {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f7f1e6;">
          ${item.productName}${item.color ? ` <span style="color:#8a7a6a;">(${item.color})</span>` : ""}
          <br /><span style="color:#8a7a6a;font-size:13px;">Qty ${item.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f7f1e6;text-align:right;white-space:nowrap;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">${rows}</table>`;
}

async function supportFooter() {
  const settings = await getSiteSettings();

  return `
    <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #f7f1e6;font-size:13px;color:#8a7a6a;">
      <strong style="color:#2a1a1f;">Please do not reply to this email.</strong> For support, contact us at
      <strong style="color:#2a1a1f;">${settings.contactEmail}</strong> or
      <strong style="color:#2a1a1f;">+${settings.whatsappNumber}</strong>.
    </p>`;
}

export async function sendOrderConfirmationEmail(order: OrderWithItems) {
  if (!order.email) return;

  const html = layout(
    "Order Confirmed",
    `
    <p style="margin:0 0 4px;">Hi ${order.customerName},</p>
    <p style="margin:0 0 16px;">Thanks for your order! Here's a summary of what you ordered.</p>
    <p style="margin:0 0 16px;font-size:14px;color:#8a7a6a;">Order <strong style="color:#2a1a1f;">${order.orderNumber}</strong></p>
    ${itemsTable(order.items)}
    <p style="text-align:right;font-size:16px;font-weight:600;margin:16px 0 24px;">Total: ${formatPrice(order.total)}</p>
    <p style="margin:0 0 4px;font-size:14px;color:#8a7a6a;">Shipping to</p>
    <p style="margin:0 0 16px;font-size:14px;">
      ${order.addressLine1}${order.addressLine2 ? `, ${order.addressLine2}` : ""}<br />
      ${order.city}, ${order.state} ${order.pincode}
    </p>
    <p style="margin:0;font-size:14px;color:#8a7a6a;">
      We'll confirm your order and delivery timeline shortly. Payment is Cash on Delivery unless otherwise arranged via WhatsApp.
    </p>
    ${await supportFooter()}`
  );

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Order Confirmed - ${order.orderNumber}`,
    html,
  });
}

export async function sendOrderStatusUpdateEmail(order: OrderWithItems) {
  if (!order.email) return;

  const label = STATUS_LABEL[order.status];

  const html = layout(
    `Order ${label}`,
    `
    <p style="margin:0 0 4px;">Hi ${order.customerName},</p>
    <p style="margin:0 0 16px;">
      Your order <strong>${order.orderNumber}</strong> is now
      <strong style="color:#7a1f2f;">${label}</strong>.
    </p>
    ${itemsTable(order.items)}
    <p style="text-align:right;font-size:16px;font-weight:600;margin:16px 0 24px;">Total: ${formatPrice(order.total)}</p>
    ${await supportFooter()}`
  );

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Order ${label} - ${order.orderNumber}`,
    html,
  });
}

export async function sendAdminNewOrderEmail(recipients: string[], order: OrderWithItems) {
  if (recipients.length === 0) return;

  const html = layout(
    "New Order Received",
    `
    <p style="margin:0 0 16px;">
      <strong>${order.customerName}</strong> (${order.phone}${order.email ? `, ${order.email}` : ""}) just placed an order.
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#8a7a6a;">Order <strong style="color:#2a1a1f;">${order.orderNumber}</strong> &middot; ${order.source === "WHATSAPP" ? "via WhatsApp" : "via website"}</p>
    ${itemsTable(order.items)}
    <p style="text-align:right;font-size:16px;font-weight:600;margin:16px 0 24px;">Total: ${formatPrice(order.total)}</p>
    <p style="margin:0;">
      <a href="${SITE_URL}/admin/orders/${order.id}" style="color:#7a1f2f;">View order in admin &rarr;</a>
    </p>`
  );

  await resend.emails.send({
    from: FROM,
    to: recipients,
    subject: `New Order - ${order.orderNumber} (${formatPrice(order.total)})`,
    html,
  });
}
