"use client";

import { logWhatsAppClick } from "@/lib/track-whatsapp-click";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  productId?: string;
  productName?: string;
  page: string;
};

export function WhatsAppTrackedLink({ productId, productName, page, onClick, ...rest }: Props) {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a
      {...rest}
      onClick={(e) => {
        logWhatsAppClick({ productId, productName, page }).catch(() => {});
        onClick?.(e);
      }}
    />
  );
}
