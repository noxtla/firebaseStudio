// src/app/notifications/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Se ha añadido el ícono 'Bot' de Lucide React
import { ArrowLeft, Loader2, Bot } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Updated Notification interface to include optional uiColor
interface Notification {
  id: string;
  userName: string;
  userAvatarUrl: string;
  badgeIcon: string;
  metadata: string;
  content: string;
  isRead: boolean;
  uiColor?: string; // Optional field for dynamic UI styling
}

// Renamed to staticNotifications to serve as a fallback
const staticNotifications: Notification[] = [
  {
    id: "1",
    userName: "Santiago Muñoz",
    userAvatarUrl: "url_to_image.png",
    badgeIcon: "rocket_emoji",
    metadata: "(following) new post • 13d",
    content: "PLANTILLA WORKSHOP",
    isRead: false
  },
  {
    id: "3",
    userName: "Alice Smith",
    userAvatarUrl: "url_to_image.png",
    badgeIcon: "rocket_emoji",
    metadata: "(following) new post • 2d",
    content: "Updated Documentation",
    isRead: true
  },
];

const NotificationsPage = () => {
  const router = useRouter();
  // State for holding the list of notifications and loading status
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Steps 2, 3, and 4: Validate, count, and set data with a fallback
  useEffect(() => {
    const storedNotifications = sessionStorage.getItem('notifications');
    if (storedNotifications) {
      try {
        const data = JSON.parse(storedNotifications);
        
        // Step 2: Validate the data structure
        if (data && Array.isArray(data.notifications_json)) {
          // Step 3: Count items before rendering
          console.log(`[SUCCESS] Found ${data.notifications_json.length} dynamic notifications to render.`);
          setNotificationList(data.notifications_json);
        } else {
          // Step 4: Fallback mechanism if structure is invalid
          console.warn("[FALLBACK] Dynamic data has invalid structure. Using static notifications.");
          setNotificationList(staticNotifications);
        }
      } catch (error) {
        // Step 4: Fallback mechanism on parsing error
        console.error("Failed to parse notifications from sessionStorage. Using static notifications.", error);
        setNotificationList(staticNotifications);
      }
    } else {
      // Step 4: Fallback mechanism if no data is found
      console.warn("[FALLBACK] No notifications found in sessionStorage. Using static notifications.");
      setNotificationList(staticNotifications);
    }
    setIsLoading(false); // Stop loading after processing
  }, []); 

  const handleBackClick = () => {
    router.back();
  };
  
  // The component now uses the 'notificationList' state
  const newNotifications = notificationList.filter(notification => !notification.isRead);
  const readNotifications = notificationList.filter(notification => notification.isRead);

  const renderNotificationItem = (notification: Notification, isNew: boolean) => (
    <div key={notification.id} className="flex items-center space-x-4 py-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={notification.userAvatarUrl} alt={notification.userName} />
        {/* ---- CAMBIO AQUÍ ---- */}
        {/* Ahora muestra un ícono de robot si el userName es "SystemTreeService" */}
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
          style={{ backgroundColor: notification.uiColor || '#3b82f6' }} // Use dynamic color or a default blue
        />
      ) : (
        <div className="h-3 w-3 rounded-full border border-gray-300 bg-white" />
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* AppBar */}
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <button onClick={handleBackClick}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">Notifications</h1>
          <div className="w-6"></div>{/* Spacer */}
        </div>
      </header>

      {/* Page Body */}
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto p-4">
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
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;