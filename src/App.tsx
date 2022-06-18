import React from 'react';
import logo from './logo.svg';
import './App.css';
import { InlineMath } from "./BlockEditor/MathComponent"
function App() {
  const [val, setVal] = React.useState("\\int_0^\\infty x^2 dx")
  return (
    <>
      {/* <div>
        <textarea value={val} onChange={(e) => setVal(e.target.value)}></textarea>
      </div>
      <InlineMath math={val} /> */}
      <label contentEditable='false'
        tabIndex={-1}
        suppressContentEditableWarning>
        <input onChange={e => { console.log(e) }}></input>
      </label>
    </>
  );
}

export default App;
