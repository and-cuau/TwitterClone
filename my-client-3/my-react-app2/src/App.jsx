import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [elements, setElements] = useState([]);
  const [inputText, setInputText] = useState("");
  const [input2Text, setInput2Text] = useState("");
  const [userText, setUserText] = useState("");
  const [uname, setUname] = useState({ name: "", user_id: "" });

  const [uname2, setUname2] = useState();

  const [profiles, setProfiles] = useState([]);
  const [followers, setFollowers] = useState([]);

  const [feed, setFeed] = useState([
    { username: "Dex", message: "hdvjd" },
    { username: "Luna", message: "hello world" },
  ]);

  const [userPosts, setUserPosts] = useState([]);

  const sendPost = async (message) => {
    try {
      const res = await fetch("http://localhost:3000/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: uname.name, text: message }),
      });

      if (!res.ok) throw new Error("Server error");

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const fetchPosts = async (message) => {
    try {
      const res = await fetch("http://localhost:3000/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the response
      console.log("Fetched posts:", data); // do something with it

      setFeed(
        data.map((el) => ({
          post_id: el.id,
          user_id: el.user_id,
          username: el.username,
          message: el.text,
        })),
      );

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const fetchUserPosts = async (message) => {
    const raw = localStorage.getItem("myData"); // jank fix
    const parsed = JSON.parse(raw);
    console.log("TEST:" + parsed.message);

    try {
      const res = await fetch(
        "http://localhost:3000/posts/user?username=" + parsed.message,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the response
      console.log("Fetched user posts:", data); // do something with it

      setUserPosts(
        data.map((el) => ({
          username: el.username,
          message: el.text,
        })),
      );

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const sendUser = async (message) => {
    try {
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: message }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the response
      console.log("Added User: ", data); // do something with it

      // uname.user_id = data.id;
      // setUname(uname);

      setUname((prevUser) => ({
        ...prevUser,
        name: message,
        user_id: data.id,
      }));

      const data2 = {
        message: message,
        user_id: data.id,
      };

      localStorage.setItem("myData", JSON.stringify(data2));

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const sendFollower = async (message) => {
    try {
      const res = await fetch("http://localhost:3000/followers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: message, follower: uname.name }),
      });

      if (!res.ok) throw new Error("Server error");

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const fetchUsers = async (message) => {
    try {
      const res = await fetch("http://localhost:3000/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the response
      console.log("Fetched users:", data); // do something with it

      // const arr = [];
      // data.forEach(el => {arr.push(el[username]);});
      // setProfiles(arr);

      setProfiles(data.map((el) => ({ id: el.id, username: el.username })));
      // setElements([...elements, inputText]);

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const fetchFollowers = async (message) => {
    const raw = localStorage.getItem("myData"); // jank fix
    const parsed = JSON.parse(raw);

    console.log("this is what sent to /followers: " + parsed.message);

    try {
      const res = await fetch(
        "http://localhost:3000/followers?username=" + parsed.message,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the response
      console.log("Fetched users:", data); // do something with it

      setFollowers(
        data.map((el) => ({
          follower_id: el.follower_id,
          follower: el.follower,
        })),
      ); // idk why the old code wasnt working but this chatgpt code is much cleaner

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const addElement = () => {
    if (inputText.trim() !== "") {
      sendPost(inputText);
      setInputText(""); // Clear the input after adding
    }
  };

  const addMessage = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const msg = input2Text;
      socketRef.current.send(input2Text);
    }
   

  }


  function editPost() {}

  const addReaction = async (data) => {
    console.log("SHOULDBE17: " + data.post_id);
    try {
      const res = await fetch("http://localhost:3000/reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message_id: data.post_id,
          user_id: data.user_id,
          reaction: data.reaction,
        }),
      });
      // {user_id: el.user_id, post_id: el.post_id, reaction: "👍"}

      if (!res.ok) throw new Error("Server error");

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  function addComment(url, method = "GET", data) {}

  //------------------------------------------------------------------------------------------------------------------

  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    //  On mount
    const raw = localStorage.getItem("myData");
    console.log("upon refresh: " + localStorage.getItem("myData"));

    try {
      if (raw) {
        const parsed = JSON.parse(raw); //json string to javascript value
        console.log("parsed is :" + parsed.message);
        // old code used same object not new to set state
        setUname((prevUser) => ({
          ...prevUser,
          name: parsed.message,
          user_id: parsed.user_id,
        }));

        console.log("if passed");
      } else {
        console.log("no saved data");
      }
    } catch (e) {
      console.error("Failed to parse localStorage data:", e);
    }

    fetchUsers();
    fetchUserPosts(uname.name); // unused var uname
    fetchPosts();
    fetchFollowers(uname.name);

    // Connect to the WebSocket server
    socketRef.current = new WebSocket("ws://localhost:8080");

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socketRef.current.onmessage = (event) => {
      setElements((prev) => [...prev, event.data]);

      console.log("HEY!");
      console.log(elements);

     // setElements([...elements, event.data]);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  // const sendMessage = () => {
  //   if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
  //     socketRef.current.send("Hello from client!");
  //   }
  // };

  return (
    <>
      <div className="page2">
        <div className="page">
          <div className="profileanddms">
            <div className="myprofile">
              <h2>{uname.user_id + " " + uname.name}</h2>
              <div className="followers">
                <span>X</span>
                <span>Followers</span>
              </div>
            </div>
            <div className="dms">

              <div className="dmsprofile"> 
                <span margins> Username </span>
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

              <div className = "dmsinputarea">
                <input value={input2Text}
            onChange={(e) => setInput2Text(e.target.value)}></input>
                <button onClick = {()=> addMessage(input2Text)}>send</button>
              </div>
            </div>
          </div>

          <div className="feeds">
            <div className="feed">
              {userPosts.map((el, idx) => (
                <div className="profile" key={idx}>
                  <p className="user">{el.username}</p>
                  <p>{el.message}</p>
                  <div className="reactions">
                    <button className="reaction" onClick={() => addReaction()}>
                      👍
                    </button>
                    <button className="reaction" onClick={() => addReaction()}>
                      👎
                    </button>
                  </div>
                </div>
              ))}
            </div> 

            <div className="feed">
              {feed.map((el, idx) => (
                <div className="profile" key={idx}>
                  {/* <p>{el.post_id}</p> */}
                  <p className="user">{el.username}</p>
                  <p>{el.message}</p>
                  <div className="reactions">
                    <button
                      className="reaction"
                      onClick={() =>
                        addReaction({
                          user_id: uname.user_id,
                          post_id: el.post_id,
                          reaction: "👍",
                        })
                      }
                    >
                      👍
                    </button>
                    <button
                      className="reaction"
                      onClick={() =>
                        addReaction({
                          user_id: uname.user_id,
                          post_id: el.post_id,
                          reaction: "👎",
                        })
                      }
                    >
                      👎
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <textarea
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="What are you thinking?"
          />
          <button onClick={addElement}>Post</button>

          <div>
            <button onClick={() => fetchFollowers(uname.name)}>
              Fetch Followers
            </button>
            <button onClick={() => fetchUserPosts(uname.name)}>
              Fetch My Posts
            </button>
            {/* <button onClick= {fetchUsers}>Fetch Users</button> */}
          </div>
        </div>

        <div className="side">
          <div className="login">
            <span>Log in</span>
            <input
              className="username"
              value={uname2}
              placeholder="username"
              onChange={(e) => setUname2(e.target.value)}
            ></input>
            <button onClick={() => sendUser(uname2)}>Enter</button>
          </div>

          <div className="followerlist">
            {followers.map((el, idx) => (
              <div className="follower" key={idx}>
                <p>{el.follower_id}</p>
                <p>{el.follower}</p>
                <button>message</button>
              </div>
            ))}
          </div>

          <div className="browse">
            {profiles.map((el, idx) => (
              <div className="profile" key={idx}>
                <span>{el.id}</span>
                <span>{el.username}</span>
                <div className="reactions">
                  <button onClick={() => sendFollower(el.username)}>
                    connect
                  </button>
                  <p className="reaction"></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
