import React from 'react';
import { Link } from 'react-router-dom';
import { Notification } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
}

const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos";
    return "agora";
};


const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose }) => {
  const notificationConfig = {
    booking: { icon: 'fa-calendar-plus', color: 'text-blue-400' },
    payment: { icon: 'fa-hand-holding-usd', color: 'text-green-400' },
    reminder: { icon: 'fa-bell', color: 'text-yellow-400' },
    tip: { icon: 'fa-lightbulb', color: 'text-purple-400' },
    offer: { icon: 'fa-star', color: 'text-yellow-400' },
    gig_booked: { icon: 'fa-check-circle', color: 'text-green-400' },
  };

  const renderNotification = (n: Notification) => {
    const config = notificationConfig[n.type] || { icon: 'fa-info-circle', color: 'text-gray-400' };
    const content = (
      <div className="flex items-start gap-4 w-full text-left">
        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 ${config.color}`}>
            <i className={`fas ${config.icon}`}></i>
        </div>
        <div className="flex-grow">
            <p className="text-sm text-gray-200">{n.message}</p>
            <p className="text-xs text-gray-500 mt-1">{timeAgo(n.timestamp)}</p>
        </div>
      </div>
    );

    if (n.link) {
      return (
        <Link to={n.link} onClick={onClose} className="block p-3 hover:bg-gray-700/50 rounded-lg">
          {content}
        </Link>
      );
    }
    
    return <div className="p-3">{content}</div>;
  };

  return (
    <div className="absolute top-full right-4 mt-2 w-80 max-w-sm bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-40 animate-fade-in">
      <div className="p-3 border-b border-gray-700">
        <h3 className="font-semibold text-white">Notificações</h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(n => <div key={n.id}>{renderNotification(n)}</div>)
        ) : (
          <p className="text-sm text-gray-400 p-6 text-center">Nenhuma notificação nova.</p>
        )}
      </div>
       <div className="p-2 bg-gray-900/50 text-center">
            {/* Em uma app real, este link levaria para uma página com todas as notificações */}
            <button onClick={onClose} className="text-xs text-red-400 hover:underline font-semibold">
                Fechar
            </button>
        </div>
    </div>
  );
};

export default NotificationPanel;
