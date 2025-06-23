"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './chat-message';
import { initialMessages, type Message } from '@/data/chat-data';

const ChatInterface = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const userMessage: Message = {
      id: String(Date.now()),
      text: newMessage,
      timestamp: new Date().toISOString(),
      sender: 'me',
      name: 'Carlos Silva',
      avatar: 'https://i.pravatar.cc/150?u=carlos-silva',
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');

    // Simulate a reply from support
    setTimeout(() => {
      const supportReply: Message = {
        id: String(Date.now() + 1),
        text: 'Thank you for your message. An agent will be with you shortly.',
        timestamp: new Date().toISOString(),
        sender: 'support',
        name: 'Support',
        avatar: 'https://i.pravatar.cc/150?u=support-agent',
      };
      setMessages((prev) => [...prev, supportReply]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center border-b bg-background/80 p-3 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Support Chat</h1>
      </header>

      {/* Message Area - This now works correctly */}
      <ScrollArea className="flex-grow p-4" viewportRef={scrollAreaRef}>
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="sticky bottom-0 z-10 flex items-center gap-2 border-t bg-background p-3"
      >
        <Button variant="ghost" size="icon" type="button">
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        <Textarea
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          rows={1}
          className="max-h-24 min-h-[40px] flex-grow resize-none self-center"
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;