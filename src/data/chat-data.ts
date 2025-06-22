export interface Message {
    id: string;
    text: string;
    timestamp: string;
    sender: 'me' | 'support';
    avatar: string;
    name: string;
  }
  
  export const initialMessages: Message[] = [
    {
      id: '1',
      text: "Hello! I'm having an issue with my vehicle's brakes. Can you help?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      sender: 'me',
      avatar: 'https://i.pravatar.cc/150?u=carlos-silva',
      name: 'Carlos Silva',
    },
    {
      id: '2',
      text: 'Hello Carlos! I can certainly help with that. Could you please provide the vehicle number?',
      timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      sender: 'support',
      avatar: 'https://i.pravatar.cc/150?u=support-agent',
      name: 'Support',
    },
    {
      id: '3',
      text: 'Yes, the truck number is 451-9876.',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      sender: 'me',
      avatar: 'https://i.pravatar.cc/150?u=carlos-silva',
      name: 'Carlos Silva',
    },
    {
      id: '4',
      text: 'Thank you. I see that truck 451-9876 is due for maintenance. I am scheduling a priority inspection for you now. Is there anything else I can assist with?',
      timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
      sender: 'support',
      avatar: 'https://i.pravatar.cc/150?u=support-agent',
      name: 'Support',
    },
  ];