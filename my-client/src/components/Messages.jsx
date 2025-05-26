import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Messages() {
  const location = useLocation();
  const toUserIDProp = location.state?.toUserIDProp ?? "No user selected";
  const toUserProp = location.state?.toUserProp ?? "No user selected";

  const [toUserInfo, setToUserInfo] = useState({ user_id: "", username: "" });

  const { setUserInfo, userInfo } = useAuth();

  const [elements, setElements] = useState([]);

  const [inputText, setInputText] = useState("");

  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
  //    if (userInfo.user_id) {
  //   connectToWebSocketServer();
  // }
  }, []);




  useEffect(() => {
    setToUserInfo({ user_id: toUserIDProp, username: toUserProp });
  }, [toUserProp]);

  function addMessage(){
    console.log("TEST of touserinfo.user_id"+toUserInfo.user_id);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const messageObject = {
        to: toUserInfo.user_id,
        from: userInfo.user_id,
        msg: inputText,
      };
      // socketRef.current.send(json.stringify(input2Text));
      socketRef.current.send(JSON.stringify(messageObject));
    }
  }

  function connectToWebSocketServer() {
    socketRef.current = new WebSocket("ws://localhost:8080");

    socketRef.current.onopen = () => {
      console.log("WebSocket connected: !!" + userInfo.user_id);
      socketRef.current.send(JSON.stringify(userInfo.user_id));
    };

    socketRef.current.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      console.log("parsed test !!!: " + parsed.msg);

      setElements((prev) => [...prev, parsed.msg]);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socketRef.current.close();
    };
  }

  return (
    <>
      {
        <div className="profileanddms">
          <div className="dms">
            <div className="dmsprofile">
              <h3 className="h2">Messaging: {toUserInfo.username} </h3>
            </div>

            <div className="messages">
               {elements.map((el, idx) => (
              <div  key={idx}>
                <span>{el}</span>
                <div className="reactions">
                  <p className="reaction"></p>
                </div>
              </div>
            ))} 
            </div>

            <div className="dmsinputarea">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></input>
              <button onClick={() => addMessage(inputText)}>send</button>
            </div>
          </div>
          <button onClick={() => connectToWebSocketServer()}></button>
        </div>
      }
    </>
  );
}

// Connect to the WebSocket server
