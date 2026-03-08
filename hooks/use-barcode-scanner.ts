"use client";

import { useEffect, useRef } from "react";

interface BarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minLength?: number;
  timeout?: number;
}

export function useBarcodeScanner({
  onScan,
  minLength = 8,
  timeout = 100,
}: BarcodeScannerOptions) {
  const barcodeBuffer = useRef<string>("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      // Ignore if typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Handle Enter (barcode scanners usually end with Enter)
      if (event.key === "Enter") {
        if (barcodeBuffer.current.length >= minLength) {
          onScan(barcodeBuffer.current);
          console.log("Barcode scanned:", barcodeBuffer.current);
        }
        barcodeBuffer.current = "";
        return;
      }

      // Append character to buffer
      if (event.key.length === 1) {
        barcodeBuffer.current += event.key;

        // Reset buffer after timeout
        timeoutRef.current = setTimeout(() => {
          barcodeBuffer.current = "";
        }, timeout);
      }
    }

    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onScan, minLength, timeout]);
}