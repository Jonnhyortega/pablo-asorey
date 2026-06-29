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
      case 'RECORD': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'PAYMENT_CONFIRMED': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'NEW_ROUTINE': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'DAY_COMPLETED': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
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
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-neutral-900">
            {unreadCount}
          </span>
        )}
      </button>


      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-neutral-800 z-[101] overflow-hidden flex flex-col max-h-[80vh]"
            onClick={handleDropdownClick}
          >
              <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/80 dark:bg-neutral-800/80 backdrop-blur-md">
                <h3 className="font-bold text-gray-800 dark:text-gray-100">Notificaciones</h3>
                <span className="text-xs bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full font-semibold">{unreadCount} nuevas</span>
              </div>
              
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No tienes notificaciones aún.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                    <AnimatePresence>
                      {notifications.map((notif) => (
                        <motion.div 
                          layout
                          key={notif.id} 
                          initial={{ backgroundColor: "transparent" }}
                          animate={{ backgroundColor: !notif.read ? "var(--tw-colors-emerald-50)" : "transparent" }}
                          transition={{ duration: 0.5 }}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors ${!notif.read ? 'dark:bg-emerald-900/10' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColorForType(notif.type)}`}>
                              {getIconForType(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-bold truncate ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{notif.title}</h4>
                              <p className={`text-sm mt-0.5 ${!notif.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>{notif.message}</p>
                              <p className="text-xs text-gray-400 dark:text-neutral-500 mt-2">
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
                                  className="p-1.5 bg-gray-200 dark:bg-neutral-700 hover:bg-emerald-500 hover:text-white text-gray-500 dark:text-gray-400 rounded-lg transition-colors shadow-sm"
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
