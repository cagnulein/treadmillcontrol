import React from 'react';

interface NumericKeypadProps {
  onNumberPress: (num: number) => void;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({ onNumberPress }) => {
  const buttonClass = "w-full aspect-square bg-gray-700 hover:bg-gray-600 active:bg-blue-700 rounded-xl text-white text-3xl font-semibold flex items-center justify-center transition-colors";
  
  const numbers = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [null, 0, null]
  ];

  return (
    <div className="mt-6">
      {numbers.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid grid-cols-3 gap-4 mb-4">
          {row.map((num, colIndex) => (
            <div key={`col-${colIndex}`}>
              {num !== null ? (
                <button
                  className={buttonClass}
                  onTouchStart={(e) => { 
                    e.preventDefault();
                    onNumberPress(num); 
                  }}
                  aria-label={`Number ${num}`}
                >
                  {num}
                </button>
              ) : (
                <div className="w-full aspect-square"></div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default NumericKeypad;