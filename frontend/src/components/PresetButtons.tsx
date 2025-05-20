import React, { useState, useEffect, useCallback } from 'react';

interface PresetButtonsProps {
  onPresetSelect: (speed: number) => void;
  currentSpeed: string;
}

const PresetButtons: React.FC<PresetButtonsProps> = ({ onPresetSelect, currentSpeed }) => {
  const [presets, setPresets] = useState<number[]>([3.5, 6.0, 8.5, 12.0]);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [progressTimer, setProgressTimer] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  // Clear any timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [longPressTimer, progressTimer]);

  const handlePressStart = (index: number) => {
    setPressedIndex(index);
    
    // Start the long press timer (5 seconds)
    const timer = window.setTimeout(() => {
      const newSpeed = parseFloat(currentSpeed);
      setPresets(prev => {
        const newPresets = [...prev];
        newPresets[index] = newSpeed;
        return newPresets;
      });
      setPressedIndex(null);
      setProgress(0);
    }, 5000) as unknown as number;
    
    // Start progress animation
    const progress = window.setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 100));
    }, 100) as unknown as number;
    
    setLongPressTimer(timer);
    setProgressTimer(progress);
  };

  const handlePressEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    if (progressTimer) {
      clearInterval(progressTimer);
      setProgressTimer(null);
    }
    setPressedIndex(null);
    setProgress(0);
  }, [longPressTimer, progressTimer]);

  const handleClick = (speed: number) => {
    if (!longPressTimer) {
      onPresetSelect(speed);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {presets.map((speed, index) => (
        <button
          key={index}
          onTouchStart={() => handlePressStart(index)}
          onTouchEnd={handlePressEnd}
          onMouseDown={() => handlePressStart(index)}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onClick={() => handleClick(speed)}
          className="py-2 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 rounded-lg text-white text-lg font-medium transition-colors relative overflow-hidden"
        >
          {pressedIndex === index && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-blue-400"
              style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
            />
          )}
          {speed.toFixed(1)}
        </button>
      ))}
    </div>
  );
};

export default PresetButtons;