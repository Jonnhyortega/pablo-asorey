"use client";

import { useState } from "react";
import { Check, Copy, DollarSign, Loader2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui";

// Alias y monto que el profe cargó en Configuración, para que el alumno pague sin preguntar.
export function PaymentDetails({ alias, amount }: { alias: string; amount: string }) {
  const [copied, setCopied] = useState(false);
  if (!alias && !amount) return null;

  const copyAlias = async () => {
    try {
      await navigator.clipboard.writeText(alias);
      setCopied(true);
      toast.success("Alias copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar, copialo a mano");
    }
  };

  return (
    <div className="mt-4 space-y-3 rounded-panel border border-line bg-surface-2 p-3">
      {amount && (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Monto</span>
          <span className="font-display text-xl leading-none text-text">{amount}</span>
        </div>
      )}
      {alias && (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-[11px] uppercase tracking-[0.2em] text-muted">Alias</span>
            <span className="block select-all truncate font-medium text-text">{alias}</span>
          </div>
          <button
            type="button"
            onClick={copyAlias}
            className="flex shrink-0 items-center gap-1.5 rounded-panel border border-line px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:border-gold hover:text-gold"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      )}
    </div>
  );
}

// Reemplaza la rutina pendiente cuando el profe activó el bloqueo por deuda.
export function PaymentLockNotice({
  dueDate,
  alias,
  amount,
  reporting,
  onReport,
}: {
  dueDate: string | null;
  alias: string;
  amount: string;
  reporting: boolean;
  onReport: () => void;
}) {
  return (
    <Card className="border-danger/40">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
          <Lock className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <p className="text-[11px] uppercase tracking-[0.3em] text-danger">Cuota vencida</p>
      </div>
      <h2 className="mt-3 font-display text-3xl uppercase leading-none text-text md:text-4xl">Regularizá tu cuota para ver tu rutina</h2>
      <p className="mt-3 text-sm text-muted">
        {dueDate ? `Tu cuota venció el ${dueDate}. ` : ""}
        Transferí y tocá «Ya pagué»: tu rutina vuelve a aparecer en cuanto avisás, y tu profe confirma el pago.
      </p>
      <div className="max-w-md">
        <PaymentDetails alias={alias} amount={amount} />
      </div>
      <button
        onClick={onReport}
        disabled={reporting}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-panel bg-gold py-3 text-xs font-semibold uppercase tracking-[0.15em] text-bg transition hover:brightness-110 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {reporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
        Ya pagué
      </button>
    </Card>
  );
}
