import { useState } from 'react';
import './App.css';

function App() {
  const [str, setStr] = useState<string>();
  // const [str, setStr] = useState<string>();

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button
          onClick={() => {
            fetch(__NVIDEO_API_URL__);
          }}
        >
          str: {str}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
