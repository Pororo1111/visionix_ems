'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type?: 'warning' | 'error' | 'info';
  onClose: (id: string) => void;
  autoClose?: boolean;
  duration?: number;
}

export function Notification({
  id,
  title,
  message,
  type = 'warning',
  onClose,
  autoClose = true,
  duration = 5000
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // 애니메이션 완료 후 제거
  };

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700';
      case 'warning':
      default:
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-500 dark:text-red-400';
      case 'info':
        return 'text-blue-500 dark:text-blue-400';
      case 'warning':
      default:
        return 'text-yellow-500 dark:text-yellow-400';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'animate-in slide-in-from-right-5' : 'animate-out slide-out-to-right-5'
    }`}>
      <div className={`max-w-sm p-4 rounded-lg border shadow-lg ${getTypeStyles()}`}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${getIconColor()}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {title}
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="ml-auto p-1 rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface NotificationManagerProps {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type?: 'warning' | 'error' | 'info';
  }>;
  onRemove: (id: string) => void;
}

export function NotificationManager({ notifications, onRemove }: NotificationManagerProps) {
  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col space-y-2 p-4 pointer-events-auto">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={onRemove}
          />
        ))}
      </div>
    </div>
  );
}