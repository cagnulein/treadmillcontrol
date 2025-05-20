import React from 'react';

interface SpeedDisplayProps {
  displayedSpeed: string;
  currentSpeed: string;
  isConfirming: boolean;
  isTransitioning: boolean;
}

const SpeedDisplay: React.FC<SpeedDisplayProps> = ({ 
  displayedSpeed, 
  currentSpeed, 
  isConfirming,
  isTransitioning
}) => {
  return (
    <div className="relative pt-8 pb-4 px-6 bg-gradient-to-b from-blue-900 to-blue-800 no-select">
      <div className="absolute top-4 right-4 text-blue-400 text-xs font-medium">
        MAX SPEED: 15.0
      </div>

      <div className="h-6"> {/* Fixed height container */}
        <div className={`absolute text-blue-300 font-medium transition-opacity duration-200 ${
          isConfirming || isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}>
          {isConfirming ? "Confirming..." : isTransitioning ? "Speed Set!" : ""}
        </div>
      </div>
      
      <div 
        className={`text-6xl font-bold text-white flex items-end transition-all duration-300 ${
          isTransitioning ? "text-green-400" : 
          isConfirming ? "text-yellow-300" : "text-white"
        }`}
      >
        {displayedSpeed}
        <span className="text-xl ml-1 mb-1.5 opacity-80">mph</span>
      </div>
    </div>
  );
};

export default SpeedDisplay;