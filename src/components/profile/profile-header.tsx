import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  name: string;
  position: string;
}

const generateUsername = (name: string) => {
    return `@${name.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function ProfileHeader({ name, position }: ProfileHeaderProps) {
  const username = generateUsername(name);
  const initials = name.split(' ').map(n => n[0]).join('');

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
        <AvatarImage src={`https://i.pravatar.cc/150?u=${username}`} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        <p className="text-gray-500">{username}</p>
        <p className="text-gray-600 mt-1">{position}</p>
      </div>
      <Button variant="outline" className="w-full max-w-xs">
        Edit Profile
      </Button>
    </div>
  );
}