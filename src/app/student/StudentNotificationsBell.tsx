"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, DollarSign, Info, Trophy, CalendarCheck, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function StudentNotificationsBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/students/me/notifications");
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
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Actualización optimista con animación
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      const res = await fetch(`/api/students/me/notifications/${id}/read`, { method: "PUT" });
      if (!res.ok) {
        fetchNotifications(); // Revertir si falla
      }
    } catch (error) {
      console.error(error);
      fetchNotifications();
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'RECORD': return <Trophy size={20} />;
      case 'PAYMENT_CONFIRMED': return <DollarSign size={20} />;
      case 'NEW_ROUTINE': return <ClipboardList size={20} />;
      case 'DAY_COMPLETED': return <CalendarCheck size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'RECORD': return 'bg-gold/10 text-gold';
      case 'PAYMENT_CONFIRMED': return 'bg-success/10 text-success';
      case 'NEW_ROUTINE': return 'bg-gold/10 text-gold';
      case 'DAY_COMPLETED': return 'bg-gold/10 text-gold';
      default: return 'bg-surface-2 text-muted';
    }
  };

  // Prevenimos que el clic dentro del dropdown lo cierre accidentalmente
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} 
        aria-label="Notificaciones"
        className="relative flex h-10 w-10 items-center justify-center rounded-panel text-muted transition-colors hover:bg-surface-2 hover:text-text"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-bg" aria-label={`${unreadCount} sin leer`} />
        )}
      </button>


      
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
                          className={`p-4 hover:bg-surface-2 transition-colors ${!notif.read ? '' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColorForType(notif.type)}`}>
                              {getIconForType(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-bold truncate ${!notif.read ? 'text-text' : 'text-muted'}`}>{notif.title}</h4>
                              <p className={`text-sm mt-0.5 ${!notif.read ? 'text-text' : 'text-muted'}`}>{notif.message}</p>
                              <p className="text-xs text-muted mt-2">
                                {new Date(notif.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!notif.read && (
                              <motion.div 
                                initial={{ scale: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="shrink-0 flex items-start"
                              >
                                <button 
                                  onClick={(e) => handleRead(notif.id, e)}
                                  className="p-1.5 bg-line hover:bg-success hover:text-text text-muted rounded-panel transition-colors"
                                  title="Marcar como leída"
                                >
                                  <Check size={16} strokeWidth={3} />
                                </button>
                              </motion.div>
                            )}
                          </div>
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
