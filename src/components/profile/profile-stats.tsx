import { Separator } from "@/components/ui/separator";

interface ProfileStatsProps {
    contributions: number;
    followers: number;
    following: number;
}

const StatItem = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
        <p className="text-xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
    </div>
);

export default function ProfileStats({ contributions, followers, following }: ProfileStatsProps) {
    return (
        <div className="flex justify-around items-center p-4 border-t border-b border-gray-200">
            <StatItem value={contributions} label="Contributions" />
            <Separator orientation="vertical" className="h-10" />
            <StatItem value={followers} label="Followers" />
            <Separator orientation="vertical" className="h-10" />
            <StatItem value={following} label="Following" />
        </div>
    );
}