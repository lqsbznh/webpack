import React from "react";
import "./a.scss"

function App() {
  const a = () => {return 1}
  const b = a();

  return (
    <div className="App">
      <header className="App-header">
        <img src={"./12.png"} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
