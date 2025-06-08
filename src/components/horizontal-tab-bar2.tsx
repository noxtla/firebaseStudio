"use client";

import { useState } from 'react';

interface HorizontalTabBarProps {
  labels: string[];
}

const HorizontalTabBar: React.FC<HorizontalTabBarProps> = ({ labels }) => {
  const [activeTab, setActiveTab] = useState(labels[0]);

  const handleClick = (label: string) => {
    setActiveTab(label);
  };

  return (
    <div className="bg-white">
      <div
        className="overflow-x-auto whitespace-nowrap py-2"
      >
        {labels.map((label) => (
          <button
            key={label}
            className={`px-4 py-2 text-lg focus:outline-none ${
              activeTab === label
                ? 'font-bold text-black'
                : 'text-gray-500 font-normal'
            }`}
            onClick={() => handleClick(label)}
          >
            {label}
            {activeTab === label && (
              <div className="h-1 bg-black mt-1"></div>
            )}
          </button>
        ))}
      </div>
      <div className="h-0.5 bg-gray-200"></div>
    </div>
  );
};

export default HorizontalTabBar;
