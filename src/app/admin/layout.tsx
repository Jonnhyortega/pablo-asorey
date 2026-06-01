export const dynamic = 'force-dynamic';

import ClientAdminShell from "./ClientAdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAdminShell>
      {children}
    </ClientAdminShell>
  );
}
