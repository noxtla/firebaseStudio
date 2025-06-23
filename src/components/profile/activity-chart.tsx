import { cn } from "@/lib/utils";

interface ActivityChartProps {
  data: number[]; // Array of activity levels (0-4)
}

const ActivityDay = ({ level }: { level: number }) => {
  const bgClass =
    level === 0 ? "bg-gray-200" :
    level === 1 ? "bg-green-200" :
    level === 2 ? "bg-green-400" :
    level === 3 ? "bg-green-600" :
    "bg-green-800";

  return <div className={cn("w-3 h-3 rounded-sm", bgClass)} title={`Activity level: ${level}`} />;
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ActivityChart({ data }: ActivityChartProps) {
  const weeks = 26; // Approx 6 months
  const days = 7;
  const totalDays = weeks * days;
  const activityData = data.slice(0, totalDays);

  return (
    <div className="p-4 border border-gray-200 rounded-lg overflow-x-auto">
        <div className="flex justify-around text-xs text-gray-500 mb-2" style={{ marginLeft: '2rem' }}>
            {MONTH_LABELS.slice(0, 6).map(month => (
                <div key={month} className="w-full text-center">{month}</div>
            ))}
        </div>
        <div className="flex gap-1">
            <div className="grid grid-rows-7 gap-1 text-xs text-gray-500 pr-2 pt-1">
                <div className="h-3 flex items-center">Mon</div>
                <div className="h-3 flex items-center"></div>
                <div className="h-3 flex items-center">Wed</div>
                <div className="h-3 flex items-center"></div>
                <div className="h-3 flex items-center">Fri</div>
                <div className="h-3 flex items-center"></div>
                <div className="h-3 flex items-center">Sun</div>
            </div>
            <div className="grid grid-flow-col grid-rows-7 gap-1">
                {Array.from({ length: totalDays }).map((_, i) => (
                    <ActivityDay key={i} level={activityData[i] || 0} />
                ))}
            </div>
        </div>
        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
            <p className="cursor-pointer hover:text-blue-600">What is this?</p>
            <div className="flex items-center gap-1">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-200" />
                <div className="w-3 h-3 rounded-sm bg-green-200" />
                <div className="w-3 h-3 rounded-sm bg-green-400" />
                <div className="w-3 h-3 rounded-sm bg-green-600" />
                <div className="w-3 h-3 rounded-sm bg-green-800" />
                <span>More</span>
            </div>
        </div>
    </div>
  );
}