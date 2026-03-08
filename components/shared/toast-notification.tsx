"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@/stores/notification-store";

export function ToastNotification() {
  const { notifications, removeNotification } = useNotificationStore();

  const getStyles = (type: string) => {
    switch (type) {
      case "success":
        return {
          bg: "#0d2010",
          border: "#166534",
          text: "#86efac",
          icon: "✓",
        };
      case "error":
        return {
          bg: "#1a0d0d",
          border: "#7f1d1d",
          text: "#fca5a5",
          icon: "✕",
        };
      case "warning":
        return {
          bg: "#1a1510",
          border: "#92400e",
          text: "#fcd34d",
          icon: "⚠",
        };
      case "info":
      default:
        return {
          bg: "#0d0d1a",
          border: "#3b1f6e",
          text: "#c4b5fd",
          icon: "ℹ",
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => {
        const styles = getStyles(notification.type);

        return (
          <div
            key={notification.id}
            className="flex items-start gap-3 p-4 rounded-xl shadow-2xl animate-slide-in"
            style={{
              backgroundColor: styles.bg,
              border: `1px solid ${styles.border}`,
              animation: "slideIn 0.3s ease-out",
            }}
          >
            <div
              className="text-xl font-bold flex-shrink-0"
              style={{ color: styles.text }}
            >
              {styles.icon}
            </div>
            <div className="flex-1">
              <div
                className="text-sm font-semibold"
                style={{ color: styles.text }}
              >
                {notification.message}
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-sm opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: styles.text }}
            >
              ✕
            </button>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}