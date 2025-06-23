"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Bot } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  userName: string;
  userAvatarUrl: string;
  badgeIcon: string;
  metadata: string;
  content: string;
  isRead: boolean;
  uiColor?: string;
}

const NotificationsPage = () => {
  const router = useRouter();
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedNotifications = sessionStorage.getItem('notifications');
    if (storedNotifications) {
      try {
        const data = JSON.parse(storedNotifications);
        if (Array.isArray(data?.notifications_json)) {
          setNotificationList(data.notifications_json);
        } else {
          setNotificationList([]);
        }
      } catch (error) {
        console.error("Failed to parse notifications from sessionStorage. Displaying empty state.", error);
        setNotificationList([]);
      }
    } else {
      setNotificationList([]);
    }
    setIsLoading(false);
  }, []); 

  const handleBackClick = () => {
    router.back();
  };
  
  const newNotifications = notificationList.filter(notification => !notification.isRead);
  const readNotifications = notificationList.filter(notification => notification.isRead);

  const renderNotificationItem = (notification: Notification, isNew: boolean) => (
    <div key={notification.id} className="flex items-center space-x-4 py-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={notification.userAvatarUrl} alt={notification.userName} />
        <AvatarFallback>
          {notification.userName === "SystemTreeService" ? (
            <Bot className="h-6 w-6 text-muted-foreground" />
          ) : (
            notification.userName.substring(0, 2).toUpperCase()
          )}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="text-sm font-bold">{notification.userName}</div>
        <div className="text-xs text-gray-500">{notification.metadata}</div>
        <div className="text-sm">{notification.content}</div>
      </div>
      {isNew ? (
        <div 
          className="h-3 w-3 rounded-full" 
          style={{ backgroundColor: notification.uiColor || '#3b82f6' }}
        />
      ) : (
        <div className="h-3 w-3 rounded-full border border-gray-300 bg-white" />
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* The page-specific header is removed. A back button and title are added here. */}
      <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={handleBackClick}>
              <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Notifications</h1>
          <div className="w-10" /> {/* Spacer to help center the title */}
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center pt-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="h-full w-full pr-4">
          {newNotifications.length > 0 && (
            <div className="mb-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-600">New</h2>
              {newNotifications.map(notification => renderNotificationItem(notification, true))}
            </div>
          )}

          {readNotifications.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-gray-600">Read</h2>
              {readNotifications.map(notification => renderNotificationItem(notification, false))}
            </div>
          )}
            
            {notificationList.length === 0 && (
                 <div className="text-center text-gray-500 pt-16">
                    <p>You have no notifications.</p>
                </div>
            )}
        </ScrollArea>
      )}
    </div>
  );
};

export default NotificationsPage;