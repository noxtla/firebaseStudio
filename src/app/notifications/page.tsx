// src/app/notifications/page.tsx

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  userName: string;
  userAvatarUrl: string;
  badgeIcon: string;
  metadata: string;
  content: string;
  isRead: boolean;
}

const notifications: Notification[] = [
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
    id: "2",
    userName: "John Doe",
    userAvatarUrl: "url_to_image.png",
    badgeIcon: "rocket_emoji",
    metadata: "(following) new post • 1d",
    content: "New Project",
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
  {
    id: "4",
    userName: "Bob Johnson",
    userAvatarUrl: "url_to_image.png",
    badgeIcon: "rocket_emoji",
    metadata: "(following) new post • 3d",
    content: "Meeting Reminder",
    isRead: true
  },
  {
    id: "5",
    userName: "Santiago Muñoz",
    userAvatarUrl: "url_to_image.png",
    badgeIcon: "rocket_emoji",
    metadata: "(following) new post • 13d",
    content: "PLANTILLA WORKSHOP",
    isRead: false
  },
  {
    id: "6",
    userName: "John Doe",
    userAvatarUrl: "url_to_image.png",
    badgeIcon: "rocket_emoji",
    metadata: "(following) new post • 1d",
    content: "New Project",
    isRead: false
  },
  {
    id: "7",
    userName: "Alice Smith",
    userAvatarUrl: "url_to_image.png",
    badgeIcon: "rocket_emoji",
    metadata: "(following) new post • 2d",
    content: "Updated Documentation",
    isRead: true
  },
  {
    id: "8",
    userName: "Bob Johnson",
    userAvatarUrl: "url_to_image.png",
    badgeIcon: "rocket_emoji",
    metadata: "(following) new post • 3d",
    content: "Meeting Reminder",
    isRead: true
  },
];

const NotificationsPage = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  const newNotifications = notifications.filter(notification => !notification.isRead);
  const readNotifications = notifications.filter(notification => notification.isRead);

  return (
    <div className="flex flex-col h-screen">
      {/* AppBar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <button onClick={handleBackClick}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">Notifications</h1>
          <div></div>{/* Empty div for spacing if needed */}
        </div>
      </div>

      {/* Page Body */}
      <div className="flex-grow overflow-y-auto p-4">
        <ScrollArea className="h-full w-full pr-4">
          {newNotifications.length > 0 && (
            <div>
              <div className="mb-2 mt-4 text-sm font-semibold">New</div>
              {newNotifications.map(notification => (
                <div key={notification.id} className="flex items-center space-x-4 py-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={notification.userAvatarUrl} alt={notification.userName} />
                    <AvatarFallback>{notification.userName.substring(0, 2)}</AvatarFallback>
                    <Badge className="absolute bottom-0 right-0 rounded-full">A</Badge>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{notification.userName}</div>
                    <div className="text-xs text-gray-500">{notification.metadata}</div>
                    <div className="text-sm">{notification.content}</div>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                </div>
              ))}
            </div>
          )}

          {readNotifications.length > 0 && (
            <div>
              <div className="mb-2 mt-4 text-sm font-semibold">Read</div>
              {readNotifications.map(notification => (
                <div key={notification.id} className="flex items-center space-x-4 py-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={notification.userAvatarUrl} alt={notification.userName} />
                    <AvatarFallback>{notification.userName.substring(0, 2)}</AvatarFallback>
                    <Badge className="absolute bottom-0 right-0 rounded-full">A</Badge>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{notification.userName}</div>
                    <div className="text-xs text-gray-500">{notification.metadata}</div>
                    <div className="text-sm">{notification.content}</div>
                  </div>
                  <div className="h-3 w-3 rounded-full border border-gray-300 bg-white" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default NotificationsPage;