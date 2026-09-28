"use client";

import { logWhatsAppClick } from "@/lib/track-whatsapp-click";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  productId?: string;
  productName?: string;
  page: string;
};

export function WhatsAppTrackedLink({ productId, productName, page, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        logWhatsAppClick({ productId, productName, page }).catch(() => {});
        onClick?.(e);
      }}
    />
  );
}
