export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";

export default async function SubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          Suscriptores
          <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">{subscribers.length} total</span>
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {subscribers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nadie se ha suscrito a tu newsletter por el momento.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Correo Electrónico</th>
                <th className="px-6 py-4 text-center">Fecha de Suscripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-green-50/10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {sub.active ? (
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-max">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Activo
                      </span>
                    ) : (
                      <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-2 w-max">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{sub.email}</td>
                  <td className="px-6 py-4 text-center text-gray-500">
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
