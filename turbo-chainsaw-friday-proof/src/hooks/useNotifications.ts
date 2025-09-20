import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// Mock notifications data
const generateMockNotifications = (accountType: string): Notification[] => {
  const baseNotifications: Notification[] = [
    {
      id: 'notif-1',
      title: 'System Update Complete',
      message: 'All AI tools have been successfully updated to the latest version.',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      read: false,
    },
    {
      id: 'notif-2',
      title: 'New Team Member Added',
      message: 'Lisa Park has been added to your team and assigned to 3 projects.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: false,
      actionUrl: 'team',
      actionLabel: 'View Team'
    },
    {
      id: 'notif-3',
      title: 'Tool Performance Alert',
      message: 'Order Processing Bot efficiency has dropped to 78%. Review recommended.',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      read: true,
      actionUrl: 'tools',
      actionLabel: 'View Tools'
    },
    {
      id: 'notif-4',
      title: 'Project Milestone Reached',
      message: 'E-commerce Automation project has reached 75% completion.',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      read: true,
      actionUrl: 'projects',
      actionLabel: 'View Project'
    },
    {
      id: 'notif-5',
      title: 'Monthly Report Available',
      message: 'Your monthly analytics report is ready for review.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      read: true,
      actionUrl: 'analytics',
      actionLabel: 'View Analytics'
    }
  ];

  // Add account-specific notifications
  if (accountType !== 'business') {
    baseNotifications.unshift({
      id: 'notif-client-1',
      title: 'New Client Inquiry',
      message: 'EcoSmart Solutions has submitted a new project proposal worth $95,000.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      read: false,
      actionUrl: 'clients',
      actionLabel: 'View Clients'
    });
  }

  return baseNotifications;
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      if (user) {
        const mockNotifications = generateMockNotifications(user.accountType);
        setNotifications(mockNotifications);
      }
      setIsLoading(false);
    }, 500);
  }, [user]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};