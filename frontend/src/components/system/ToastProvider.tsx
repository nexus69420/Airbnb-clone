/**
 * Toast host (react-hot-toast).
 */

"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        className: "text-sm",
        style: {
          borderRadius: "12px",
          background: "var(--abnb-surface)",
          color: "var(--abnb-fg)",
          border: "1px solid var(--abnb-border)",
        },
      }}
    />
  );
}
