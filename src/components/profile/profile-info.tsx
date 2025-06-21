import { Clock, CalendarDays } from "lucide-react";
import { format } from "date-fns";

interface ProfileInfoProps {
    lastActive: string;
    joinedDate: string; // YYYY-MM-DD
}

export default function ProfileInfo({ lastActive, joinedDate }: ProfileInfoProps) {
    const formattedJoinedDate = format(new Date(joinedDate), "MMM d, yyyy");

    return (
        <div className="space-y-2 text-gray-600 px-2">
            <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>Active {lastActive}</span>
            </div>
            <div className="flex items-center space-x-3">
                <CalendarDays className="w-5 h-5 text-gray-400" />
                <span>Joined {formattedJoinedDate}</span>
            </div>
        </div>
    );
}