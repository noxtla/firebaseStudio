"use client";

interface HorizontalTabBarProps {
  labels: string[];
  onTabClick: (label: string) => void;
  activeTab: string; // Now controlled from parent
}

const HorizontalTabBar: React.FC<HorizontalTabBarProps> = ({ labels, activeTab, onTabClick }) => {
  return (
    <div className="bg-white">
      <div
        className="overflow-x-auto whitespace-nowrap py-2"
      >
        {labels.map((label) => (
          <button
            key={label}
            className={`px-4 py-2 text-lg focus:outline-none transition-colors duration-200 ${
              activeTab === label
                ? 'font-bold text-foreground'
                : 'text-muted-foreground font-normal hover:text-foreground'
            }`}
            onClick={() => onTabClick(label)}
          >
            {label}
            {activeTab === label && (
              <div className="h-1 bg-primary mt-1"></div>
            )}
          </button>
        ))}
      </div>
      <div className="h-0.5 bg-gray-200"></div>
    </div>
  );
};

export default HorizontalTabBar;