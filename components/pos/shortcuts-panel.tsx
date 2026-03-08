"use client";

import { useState } from "react";

export function ShortcutsPanel({ onClose }: { onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(true);

  function handleClose() {
    setIsOpen(false);
    onClose?.();
  }

  const shortcuts = [
    { key: "F1", description: "Show shortcuts" },
    { key: "F2", description: "Focus search" },
    { key: "F3", description: "Clear cart" },
    { key: "F4", description: "Customer search" },
    { key: "F9", description: "Open payment" },
    { key: "Esc", description: "Close modal" },
    { key: "Ctrl+D", description: "Dashboard" },
    { key: "Ctrl+L", description: "Logout" },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-40"
        style={{
          backgroundColor: "#1f1040",
          border: "1px solid #7c3aed",
          color: "#a78bfa",
        }}
        title="Keyboard shortcuts (F1)"
      >
        ?
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[150]"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-md p-6 rounded-2xl"
        style={{
          backgroundColor: "#0d0d1a",
          border: "1px solid #3b1f6e",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold" style={{ color: "#e0d8f8" }}>
            Keyboard Shortcuts
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-lg"
            style={{ color: "#6b6b8a" }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 rounded-lg"
              style={{ backgroundColor: "#14141f" }}
            >
              <span className="text-sm" style={{ color: "#c0b8d8" }}>
                {shortcut.description}
              </span>
              <kbd
                className="px-3 py-1 rounded text-xs font-mono font-bold"
                style={{
                  backgroundColor: "#1f1040",
                  border: "1px solid #7c3aed",
                  color: "#c4b5fd",
                }}
              >
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <div
          className="mt-6 p-3 rounded-lg text-xs text-center"
          style={{
            backgroundColor: "#14141f",
            color: "#6b6b8a",
          }}
        >
          Press <kbd className="font-mono">F1</kbd> anytime to show this panel
        </div>
      </div>
    </div>
  );
}