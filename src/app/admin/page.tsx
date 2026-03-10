export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, MessageSquare, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const [messagesCount, subscribersCount, recentMessages] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.newsletterSubscriber.count(),
    prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Resumen del sitio</h2>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <MessageSquare size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mensajes (Leads)</p>
            <p className="text-3xl font-bold text-gray-800">{messagesCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-full">
            <Users size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Suscriptores (Newsletter)</p>
            <p className="text-3xl font-bold text-gray-800">{subscribersCount}</p>
          </div>
        </div>
      </div>

      {/* Lista Rápida */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Últimos Mensajes</h3>
          <Link href="/admin/leads" className="text-sm text-[#dda124] hover:underline flex items-center gap-1 font-semibold">
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>
        
        {recentMessages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aún no tienes mensajes nuevos en tu bandeja de entrada.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentMessages.map((msg) => (
              <div key={msg.id} className={`p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50 transition-colors ${!msg.read ? 'bg-blue-50/20' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{msg.name}</span>
                    {!msg.read && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">Nuevo</span>}
                  </div>
                  <p className="text-sm text-gray-600 truncate max-w-xl">{msg.message}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm text-gray-500">
                    {msg.createdAt.toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <a href={`mailto:${msg.email}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 underline mt-1">
                    {msg.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
