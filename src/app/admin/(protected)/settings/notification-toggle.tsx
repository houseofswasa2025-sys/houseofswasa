"use client";

import { useEffect, useState } from "react";
import { saveSubscription, deleteSubscription } from "./actions";

type Status = "loading" | "unsupported" | "denied" | "off" | "on";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function NotificationToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }
      const registration = await navigator.serviceWorker.ready.catch(() => null);
      const subscription = await registration?.pushManager.getSubscription();
      setStatus(subscription ? "on" : "off");
    })();
  }, []);

  async function enable() {
    setError("");
    setPending(true);
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) throw new Error("Push notifications aren't configured yet.");

      const registration = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const json = subscription.toJSON();
      await saveSubscription({
        endpoint: subscription.endpoint,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
      setStatus("on");
    } catch {
      setError("Couldn't enable notifications. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function disable() {
    setError("");
    setPending(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await deleteSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus("off");
    } catch {
      setError("Couldn't disable notifications. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="rounded-xl border border-gold-light/60 bg-white p-5">
      <h2 className="font-semibold text-foreground">Push Notifications</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Get notified on this device for new orders, low stock, new reviews, and WhatsApp clicks.
        Install House of Swasa Admin as an app first for the best experience.
      </p>

      {status === "unsupported" && (
        <p className="mt-3 text-sm text-foreground/50">
          This browser doesn&apos;t support push notifications.
        </p>
      )}

      {status === "denied" && (
        <p className="mt-3 text-sm text-red-600">
          Notifications are blocked for this site in your browser settings. Enable them there, then
          reload this page.
        </p>
      )}

      {(status === "on" || status === "off") && (
        <button
          type="button"
          onClick={status === "on" ? disable : enable}
          disabled={pending}
          className={`mt-3 rounded-full px-5 py-2 text-sm font-semibold transition-all disabled:opacity-60 ${
            status === "on"
              ? "border border-gold-light text-foreground/70 hover:border-maroon"
              : "bg-maroon text-white hover:bg-maroon-dark"
          }`}
        >
          {pending ? "..." : status === "on" ? "Disable Notifications" : "Enable Notifications"}
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
