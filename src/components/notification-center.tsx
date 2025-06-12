"use client";

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"


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


export default function NotificationCenter() {
  const [open, setOpen] = useState(false);

  const newNotifications = notifications.filter(notification => !notification.isRead);
  const readNotifications = notifications.filter(notification => notification.isRead);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Bell className="h-5 w-5 cursor-pointer" />
      </AlertDialogTrigger>
      <AlertDialogContent className="w-full max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Notifications</AlertDialogTitle>
          <AlertDialogDescription>
            Here are your latest updates.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="h-[400px] w-full pr-4">
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
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
