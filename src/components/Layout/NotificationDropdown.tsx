import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, ExternalLink, CheckCheck } from 'lucide-react';
import { useNotifications, Notification } from '../../hooks/useNotifications';

interface NotificationDropdownProps {
  onNavigate: (view: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      onNavigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--fg)]"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-pink)] text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 max-h-96 w-96 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <h3 className="text-lg font-semibold text-[var(--fg)]">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-1 text-xs text-[var(--accent-purple)] transition-colors hover:text-[var(--accent-pink)]"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-[var(--fg-muted)]">
                <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`cursor-pointer px-4 py-3 transition-colors hover:bg-[var(--surface)] ${
                      !notification.read ? 'bg-[var(--surface)]/80' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                !notification.read ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm text-[var(--fg-muted)]">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-[var(--fg-muted)]">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                              {notification.actionUrl && (
                                <div className="flex items-center space-x-1 text-xs text-[var(--accent-purple)]">
                                  <span>{notification.actionLabel}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-[var(--accent-pink)]"></div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <button
                onClick={() => {
                  onNavigate('notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-[var(--accent-purple)] transition-colors hover:text-[var(--accent-pink)]"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;