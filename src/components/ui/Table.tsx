import { cn } from "@/lib/cn";

// stackOnMobile: debajo de md cada fila se apila y cada celda muestra su data-label
function Table({ stackOnMobile = false, className, children }: { stackOnMobile?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("border border-line rounded-panel bg-surface", !stackOnMobile && "overflow-x-auto")}>
      <table className={cn("w-full text-sm", stackOnMobile && "table-stack", className)}>{children}</table>
    </div>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-line">
      <tr>{children}</tr>
    </thead>
  );
}

function HeadCell({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <th className={cn("px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.2em] text-muted whitespace-nowrap", className)}>
      {children}
    </th>
  );
}

function Row({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-b border-line last:border-b-0 transition-colors hover:bg-surface-2", className)} {...props}>
      {children}
    </tr>
  );
}

function Cell({ label, className, children }: { label?: string; className?: string; children?: React.ReactNode }) {
  return (
    <td data-label={label} className={cn("px-4 py-3 text-text align-middle", className)}>
      {children}
    </td>
  );
}

Table.Head = Head;
Table.HeadCell = HeadCell;
Table.Row = Row;
Table.Cell = Cell;

export { Table };
