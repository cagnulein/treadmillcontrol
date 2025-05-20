import React from 'react';
import TreadmillRemote from './components/TreadmillRemote';

function App() {
  const handleValueChange = (newSpeed: string) => {
    fetch(`/set_speed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mph: newSpeed })
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-1">
      <TreadmillRemote onValueChange={handleValueChange} />
    </div>
  );
}

export default App;