import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

export type NotificationType = 'info' | 'warning' | 'success';

export interface NotificationProps {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  onClose: (id: string) => void;
}

export const Notification = ({ id, message, type, duration = 5000, onClose }: NotificationProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    info: <Info size={20} className="text-blue-400" />,
    warning: <AlertTriangle size={20} className="text-yellow-400" />,
    success: <CheckCircle size={20} className="text-green-400" />
  };

  const bgColors = {
    info: 'bg-blue-900/90 border-blue-500/50',
    warning: 'bg-yellow-900/90 border-yellow-500/50',
    success: 'bg-green-900/90 border-green-500/50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${bgColors[type]} text-white mb-2`}
    >
      {icons[type]}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={() => onClose(id)} className="text-white/50 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </motion.div>
  );
};

export const NotificationContainer = ({ notifications, onClose }: { notifications: Omit<NotificationProps, 'onClose'>[], onClose: (id: string) => void }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 flex flex-col items-center pointer-events-none">
      <AnimatePresence>
        {notifications.map(notif => (
          <div key={notif.id} className="w-full pointer-events-auto">
            <Notification {...notif} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
