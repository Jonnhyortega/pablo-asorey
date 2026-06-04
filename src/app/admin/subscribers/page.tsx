export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";

export default async function SubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          Suscriptores
          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm px-3 py-1 rounded-full">{subscribers.length} total</span>
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-x-auto transition-colors">
        {subscribers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            Nadie se ha suscrito a tu newsletter por el momento.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-200 font-semibold border-b border-gray-200 dark:border-slate-800 transition-colors">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Correo Electrónico</th>
                <th className="px-6 py-4 text-center">Fecha de Suscripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sub.active ? (
                      <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-max">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Activo
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-max">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{sub.email}</td>
                  <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {sub.createdAt.toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
