import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          XBoard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Multiple X (Twitter) Timeline Widget
        </p>
        
        <div className="text-center">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            onClick={() => setCount((count) => count + 1)}
          >
            Count is {count}
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
          Development server is running ✅
        </div>
      </div>
    </div>
  );
}

export default App;