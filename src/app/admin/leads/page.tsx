import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function LeadsPage() {
  const leads = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          Mensajes y Leads
          <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">{leads.length} total</span>
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No tienes mensajes en la bandeja de entrada.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Nombre / Lead</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Mensaje Original</th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-blue-50/10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {lead.createdAt.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}<br/>
                    <span className="text-xs text-gray-400">{lead.createdAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute:'2-digit' })}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{lead.name}</td>
                  <td className="px-6 py-4 font-medium text-blue-600 hover:text-blue-800 hover:underline">
                    <a href={`mailto:${lead.email}`}>{lead.email}</a>
                  </td>
                  <td className="px-6 py-4 max-w-sm truncate" title={lead.message}>{lead.message}</td>
                  <td className="px-6 py-4 text-center">
                    {!lead.read ? (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">Nuevo</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">Leído</span>
                    )}
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
