import React, { useState, useEffect, useCallback } from 'react';
import SpeedDisplay from './SpeedDisplay';
import NumericKeypad from './NumericKeypad';
import PresetButtons from './PresetButtons';
import useSpeedEntry from '../hooks/useSpeedEntry';
import { RotateCcw, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface TreadmillRemoteProps {
  onValueChange?: (newSpeed: string) => void;
}

const TreadmillRemote: React.FC<TreadmillRemoteProps> = ({ onValueChange }) => {
  const { 
    currentSpeed, 
    displayedSpeed, 
    handleNumberPress, 
    handleClear,
    handlePreset,
    isConfirming,
    isTransitioning
  } = useSpeedEntry({ onValueChange });

  const [isConnected, setIsConnected] = useState<boolean>(true);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch('/status');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
      console.error("Error fetching status:", error);
    }
  }, []);

  useEffect(() => {
    checkStatus(); // Initial check
    const intervalId = setInterval(checkStatus, 15000); // Poll every 15 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [checkStatus]);

  const handleReconnect = async () => {
    try {
      await fetch('/reconnect', { method: 'GET' });
      // Optionally, re-check status immediately or wait for next poll
      setTimeout(checkStatus, 1000); // Check status after 1s to allow reconnect to process
    } catch (error) {
      console.error("Error reconnecting:", error);
      // Consider setting isConnected to false here or showing a specific error
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
        {isConnected ? (
          <Wifi size={20} className="text-green-500" />
        ) : (
          <WifiOff size={20} className="text-red-500" />
        )}
        <button
          onClick={handleReconnect}
          className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="Reconnect"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <SpeedDisplay 
        displayedSpeed={displayedSpeed} 
        currentSpeed={currentSpeed} 
        isConfirming={isConfirming}
        isTransitioning={isTransitioning}
      />
      
      <div className="p-6 pt-4">
        <PresetButtons 
          onPresetSelect={handlePreset} 
          currentSpeed={currentSpeed}
        />
        
        <NumericKeypad onNumberPress={handleNumberPress} />
      </div>
    </div>
  );
};

export default TreadmillRemote