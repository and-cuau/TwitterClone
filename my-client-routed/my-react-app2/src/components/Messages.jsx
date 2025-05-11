import { useEffect, useRef, useState } from "react";

export default function Signup() {
  return (
    <>
      <div className="profileanddms">
        <div className="dms">
          <div className="dmsprofile">
            <h2 className="h2"> {dmuname} </h2>
          </div>

          <div className="messages">
            {elements.map((el, idx) => (
              <div className="profile" key={idx}>
                <span>{el}</span>
                <div className="reactions">
                  <p className="reaction"></p>
                </div>
              </div>
            ))}
          </div>

          <div className="dmsinputarea">
            <input
              value={input2Text}
              onChange={(e) => setInput2Text(e.target.value)}
            ></input>
            <button onClick={() => addMessage(input2Text)}>send</button>
          </div>
        </div>
      </div>
    </>
  );
}
