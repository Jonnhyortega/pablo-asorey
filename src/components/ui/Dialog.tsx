"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: "modal" | "sheet";
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

const subscribeNoop = () => () => {};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, title, description, variant = "modal", footer, className, children }: DialogProps) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const reduce = useReducedMotion();
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Respeta un autoFocus ya aplicado; si no, enfoca el primer control del contenido
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) {
      const first = panel.querySelector<HTMLElement>(`[data-dialog-body] :is(${FOCUSABLE})`) ?? panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
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
  }, [open]);

  if (!mounted) return null;

  const isSheet = variant === "sheet";
  const panelMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : isSheet
      ? { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 24 } }
      : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 12 } };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div data-panel className={cn("fixed inset-0 z-[100] flex bg-transparent", isSheet ? "items-end md:items-stretch md:justify-end" : "items-center justify-center p-4")}>
          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            {...panelMotion}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative flex flex-col bg-surface border border-line text-text outline-none max-h-[90svh]",
              isSheet
                ? "w-full rounded-t-[12px] md:rounded-none md:max-h-none md:h-full md:max-w-md md:border-y-0 md:border-r-0"
                : "w-full max-w-lg rounded-panel",
              className
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 md:px-6">
              <div className="min-w-0">
                <h2 id={titleId} className="font-display text-xl uppercase leading-tight">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-1 text-sm text-muted">
                    {description}
                  </p>
                )}
              </div>
              <button onClick={onClose} aria-label="Cerrar" className="-mr-1 p-1 text-muted transition-colors hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children && <div data-dialog-body className="flex-1 overflow-y-auto px-5 py-5 md:px-6">{children}</div>}
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4 md:px-6">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
