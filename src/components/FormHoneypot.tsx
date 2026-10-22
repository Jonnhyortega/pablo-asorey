"use client";

import { useEffect, useRef } from "react";

// Campos anti-bot que viajan con cada formulario público (ver lib/form-guard).
// Uso: const guard = useFormGuard(); <FormHoneypot inputRef={guard.honeypotRef} />;
// y al enviar: body: JSON.stringify({ ...datos, ...guard.fields() })
export function useFormGuard() {
  const startedAt = useRef(0);
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  return {
    honeypotRef,
    fields: () => ({ website: honeypotRef.current?.value ?? "", startedAt: startedAt.current }),
  };
}

export function FormHoneypot({ inputRef }: { inputRef: React.RefObject<HTMLInputElement | null> }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        No completar este campo
        <input ref={inputRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
