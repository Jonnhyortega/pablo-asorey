"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Mientras `open` es true: Esc llama a onClose, Tab queda dentro de `ref`,
// el scroll del body se bloquea y al cerrar el foco vuelve a donde estaba.
// `initialFocusSelector` elige qué enfocar primero dentro del contenedor.
export function useFocusTrap(
  open: boolean,
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
  initialFocusSelector?: string
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Respeta un autoFocus ya aplicado; si no, enfoca el primer control
    const container = ref.current;
    if (container && !container.contains(document.activeElement)) {
      const first =
        (initialFocusSelector && container.querySelector<HTMLElement>(initialFocusSelector)) ||
        container.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? container).focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus?.();
    };
  }, [open, ref, initialFocusSelector]);
}
