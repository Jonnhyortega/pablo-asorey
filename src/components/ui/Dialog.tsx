"use client";

import { useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "./useFocusTrap";

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

// Primer control del contenido (no el botón de cerrar del encabezado)
const BODY_FOCUSABLE = '[data-dialog-body] :is(a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]))';

export function Dialog({ open, onClose, title, description, variant = "modal", footer, className, children }: DialogProps) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const titleId = useId();
  const descId = useId();

  useFocusTrap(open, panelRef, onClose, BODY_FOCUSABLE);

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
