import type { FC } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Message } from '@/data/chat-data';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const isMe = message.sender === 'me';

  return (
    <div className={cn('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
      {!isMe && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.avatar} alt={message.name} />
          <AvatarFallback>{message.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-xs md:max-w-md rounded-2xl p-3 text-sm shadow-md',
          isMe
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground rounded-bl-none'
        )}
      >
        <p className="break-words">{message.text}</p>
        <p
          className={cn(
            'text-xs mt-1.5',
            isMe ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'
          )}
        >
          {format(new Date(message.timestamp), 'h:mm a')}
        </p>
      </div>
      {isMe && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.avatar} alt={message.name} />
          <AvatarFallback>{message.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;