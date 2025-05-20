import { useState, useEffect, useCallback } from 'react';

const MAX_SPEED = 15.0;
const CONFIRMATION_DELAY = 1200; // ms (used by presets)
const AMBIGUOUS_CONFIRMATION_DELAY = 2000; // ms (new delay for ambiguous entries)
const TRANSITION_DURATION = 250; // ms

interface UseSpeedEntryProps {
  onValueChange?: (newSpeed: string) => void;
}

const useSpeedEntry = ({ onValueChange }: UseSpeedEntryProps = {}) => {
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [currentSpeed, setCurrentSpeed] = useState<string>('0.0');
  const [displayedSpeed, setDisplayedSpeed] = useState<string>('0.0');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [confirmationTimer, setConfirmationTimer] = useState<number | null>(null);

  // Clear any pending confirmation timer when component unmounts
  useEffect(() => {
    return () => {
      if (confirmationTimer) {
        clearTimeout(confirmationTimer);
      }
    };
  }, [confirmationTimer]);

  // Format speed for display
  const formatSpeed = useCallback((value: string): string => {
    if (!value) return '0.0';
    
    // For single digits, treat as whole numbers
    if (value.length === 1) return `${value}.0`;
    
    // For two digits, insert decimal point between them
    if (value.length === 2) return `${value[0]}.${value[1]}`;
    
    // For three digits, format as XX.X
    if (value.length === 3) return `${value.slice(0, 2)}.${value[2]}`;
    
    return value;
  }, []);

  // Convert displayed speed string to number for validation
  const getSpeedValue = useCallback((speed: string): number => {
    return parseFloat(speed.replace(/[^0-9.]/g, ''));
  }, []);

  // Check if a speed value would be valid
  const isValidSpeed = useCallback((speed: number): boolean => {
    return speed <= MAX_SPEED && speed >= 0;
  }, []);

  // Process number button presses
  const handleNumberPress = useCallback((num: number) => {
    // Clear any pending confirmation
    if (confirmationTimer) {
      clearTimeout(confirmationTimer);
      setConfirmationTimer(null);
      setIsConfirming(false);
    }

    // If we're in the middle of a transition from a completed entry,
    // or the buffer is full, start fresh
    const shouldStartFresh = inputBuffer.length >= 3;
    
    let newBuffer: string;
    let formattedSpeed: string;

    if (shouldStartFresh) {
      newBuffer = String(num);
      formattedSpeed = formatSpeed(newBuffer);
    } else {
      // Add to existing buffer
      newBuffer = `${inputBuffer}${num}`;
      formattedSpeed = formatSpeed(newBuffer);
      
      // Validate the speed
      const speedValue = getSpeedValue(formattedSpeed);
      if (!isValidSpeed(speedValue)) {
        newBuffer = String(num);
        formattedSpeed = formatSpeed(newBuffer);
      }
    }

    // Update both buffer and display
    setInputBuffer(newBuffer);
    setDisplayedSpeed(formattedSpeed);
    setIsTransitioning(false);

    // Determine confirmation delay based on ambiguity
    let calculatedConfirmationDelay: number;
    if (newBuffer.length === 1) {
      calculatedConfirmationDelay = AMBIGUOUS_CONFIRMATION_DELAY; // Ambiguous: 1 digit
    } else if (newBuffer.length === 2 && newBuffer.startsWith('1')) {
      calculatedConfirmationDelay = AMBIGUOUS_CONFIRMATION_DELAY; // Ambiguous: 2 digits, first is 1
    } else {
      // Not ambiguous (e.g., 2 digits not starting with '1', or 3 digits)
      calculatedConfirmationDelay = 0;
    }

    if (calculatedConfirmationDelay === 0) {
      // Immediate action
      if (confirmationTimer) { // Clear any existing timer from a previous ambiguous entry
        clearTimeout(confirmationTimer);
        setConfirmationTimer(null);
      }
      setIsConfirming(false); // Not in confirming state for immediate actions
      setIsTransitioning(true);
      setCurrentSpeed(formattedSpeed);
      setInputBuffer(''); // Clear buffer after successful immediate set
      
      setTimeout(() => {
        setIsTransitioning(false);
        if (onValueChange) {
          onValueChange(formattedSpeed);
        }
      }, TRANSITION_DURATION);
    } else {
      // Delayed action (uses calculatedConfirmationDelay)
      // The clearing of confirmationTimer at the beginning of handleNumberPress is still relevant here.
      const timer = window.setTimeout(() => {
        setIsConfirming(false);
        setIsTransitioning(true);
        setCurrentSpeed(formattedSpeed);
        setInputBuffer(''); // Clear buffer after confirmed set
        
        setTimeout(() => {
          setIsTransitioning(false);
          if (onValueChange) {
            onValueChange(formattedSpeed);
          }
        }, TRANSITION_DURATION);
      }, calculatedConfirmationDelay);
      
      setConfirmationTimer(timer);
      setIsConfirming(true);
    }
  }, [confirmationTimer, formatSpeed, getSpeedValue, isValidSpeed, inputBuffer, onValueChange]);

  // Handle preset speed selection
  const handlePreset = useCallback((speed: number) => {
    // Clear any pending confirmation
    if (confirmationTimer) {
      clearTimeout(confirmationTimer);
      setConfirmationTimer(null);
    }
    
    const speedString = speed.toFixed(1);
    setDisplayedSpeed(speedString);
    setIsConfirming(true);
    setInputBuffer('');
    
    // Start confirmation timer
    const timer = window.setTimeout(() => {
      setIsConfirming(false);
      setIsTransitioning(true);
      setCurrentSpeed(speedString);
      setInputBuffer('');
      
      setTimeout(() => {
        setIsTransitioning(false);
        if (onValueChange) {
          onValueChange(speedString);
        }
      }, TRANSITION_DURATION);
    }, CONFIRMATION_DELAY);
    
    setConfirmationTimer(timer);
  }, [confirmationTimer, onValueChange]);

  // Clear input and reset
  const handleClear = useCallback(() => {
    if (confirmationTimer) {
      clearTimeout(confirmationTimer);
      setConfirmationTimer(null);
    }
    
    setInputBuffer('');
    setDisplayedSpeed(currentSpeed);
    setIsConfirming(false);
    setIsTransitioning(false);
  }, [confirmationTimer, currentSpeed]);

  return {
    currentSpeed,
    displayedSpeed,
    handleNumberPress,
    handleClear,
    handlePreset,
    isConfirming,
    isTransitioning
  };
};

export default useSpeedEntry;