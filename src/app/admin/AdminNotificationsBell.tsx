"use client";

import { useState, useEffect } from "react";
import { Bell, Check, DollarSign, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminNotificationsBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Podemos hacer un polling simple cada 1 minuto
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleResolve = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/notifications/${id}/resolve`, { method: "PUT" });
      if (res.ok) {
        toast.success("Notificación aprobada y resuelta.");
        fetchNotifications();
      } else {
        toast.error("Error al resolver notificación");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado");
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 z-50 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Notificaciones</h3>
              <span className="text-xs bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full font-semibold">{unreadCount} nuevas</span>
            </div>
            
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No tienes notificaciones aún.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                      <div className="flex gap-3">
                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notif.type === 'PAYMENT_REQUEST' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {notif.type === 'PAYMENT_REQUEST' ? <DollarSign size={20} /> : <Info size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{notif.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {new Date(notif.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="shrink-0 flex items-start">
                            <button 
                              onClick={(e) => handleResolve(notif.id, e)}
                              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                              title="Marcar como resuelto"
                            >
                              <Check size={16} strokeWidth={3} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
