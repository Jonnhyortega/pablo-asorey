"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, Check, DollarSign, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminNotificationsBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
    fetchNotifications();
    // Podemos hacer un polling simple cada 1 minuto
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Bloqueo de scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // action solo aplica a avisos de pago: "approve" renueva el mes, "reject" lo devuelve al alumno.
  const handleResolve = async (id: string, e: React.MouseEvent, action?: "approve" | "reject") => {
    e.stopPropagation();
    // Actualización optimista con animación
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      const res = await fetch(`/api/admin/notifications/${id}/resolve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action ? { action } : {}),
      });
      if (res.ok) {
        toast.success(action === "approve" ? "Pago aceptado: se renovó el mes del alumno." : action === "reject" ? "Pago rechazado: se le avisó al alumno." : "Notificación marcada como leída.");
        fetchNotifications();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Error al resolver notificación");
        fetchNotifications(); // Revertir
      }
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado");
      fetchNotifications();
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} 
        aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
        className="relative flex h-10 w-10 items-center justify-center rounded-panel text-muted transition-colors hover:bg-surface-2 hover:text-text"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-bg" aria-hidden />
        )}
      </button>

      <AnimatePresence>
        {isOpen && mounted && createPortal(
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50" 
            onClick={() => setIsOpen(false)}
          ></motion.div>,
          document.body
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-x-4 top-16 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-96 bg-surface rounded-panel border border-line z-[101] overflow-hidden flex flex-col max-h-[80vh]"
            onClick={handleDropdownClick}
          >
              <div className="p-4 border-b border-line flex justify-between items-center">
                <h3 className="font-display text-lg uppercase text-text">Notificaciones</h3>
                <span className="text-[11px] uppercase tracking-[0.2em] text-gold">{unreadCount} nuevas</span>
              </div>
              
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No tienes notificaciones aún.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-line">
                    <AnimatePresence>
                      {notifications.map((notif) => (
                        <motion.div 
                          layout
                          key={notif.id} 
                          initial={{ backgroundColor: "transparent" }}
                          animate={{ backgroundColor: !notif.read ? "color-mix(in srgb, var(--gold) 6%, transparent)" : "transparent" }}
                          transition={{ duration: 0.5 }}
                          className={`p-4 hover:bg-surface-2 transition-colors ${!notif.read ? 'border-l-2 border-gold' : 'border-l-2 border-transparent'}`}
                        >
                          <div className="flex gap-3">
                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notif.type === 'PAYMENT_REQUEST' ? 'bg-success/10 text-success' : 'bg-gold/10 text-gold'}`}>
                              {notif.type === 'PAYMENT_REQUEST' ? <DollarSign size={20} /> : <Info size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-bold truncate ${!notif.read ? 'text-text' : 'text-muted'}`}>{notif.title}</h4>
                              <p className={`text-sm mt-0.5 line-clamp-2 ${!notif.read ? 'text-text' : 'text-muted'}`}>{notif.message}</p>
                              <p className="text-xs text-muted mt-2">
                                {new Date(notif.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notif.read && notif.type !== 'PAYMENT_REQUEST' && (
                              <motion.div 
                                initial={{ scale: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="shrink-0 flex items-start"
                              >
                                <button 
                                  onClick={(e) => handleResolve(notif.id, e)}
                                  className="p-1.5 bg-gold hover:brightness-110 text-bg rounded-panel transition-colors"
                                  title="Marcar como leída"
                                  aria-label="Marcar como leída"
                                >
                                  <Check size={16} strokeWidth={3} />
                                </button>
                              </motion.div>
                            )}
                          </div>
                          {!notif.read && notif.type === 'PAYMENT_REQUEST' && (
                            <div className="mt-3 flex gap-2 pl-[52px]">
                              <button
                                onClick={(e) => handleResolve(notif.id, e, "approve")}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-panel bg-gold py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-bg transition hover:brightness-110"
                              >
                                <Check size={14} strokeWidth={3} /> Aceptar
                              </button>
                              <button
                                onClick={(e) => handleResolve(notif.id, e, "reject")}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-panel border border-line py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:border-danger hover:text-danger"
                              >
                                <X size={14} strokeWidth={3} /> Rechazar
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
