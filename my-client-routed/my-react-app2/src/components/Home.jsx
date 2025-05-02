import { useEffect, useRef, useState } from "react";
import "../App.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from './Login';

export default function Home() {
  const [selected, setSelected] = useState("");
  const [elements, setElements] = useState([]);
  const [inputText, setInputText] = useState("");
  const [input2Text, setInput2Text] = useState("");
  const [uname, setUname] = useState({ name: "test", user_id: "" });
  const [numfollowers, setNumfollowers] = useState("-1");
  const [pword, setPword] = useState("");
  const [dmuname, setDmuname] = useState("test");
  const globaltoidRef = useRef(null);
  const [uname2, setUname2] = useState();
  const [profiles, setProfiles] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [feed, setFeed] = useState([
    { username: "Dex", message: "hdvjd" },
    { username: "Luna", message: "hello world" },
  ]);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { setIsAdmin, isAdmin } = useAuth();
  const { setIsLoggedInGlobal, isLoggedInGlobal } = useAuth();

  const sendPost = async (message) => {
    const token = localStorage.getItem("token");
    console.log("token on sending post" + token);

    try {
      const res = await fetch("http://localhost:3000/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <<< Added Auth line
        },
        body: JSON.stringify({
          user_id: uname.user_id,
          username: uname.name,
          text: message,
        }),
      });

      if (!res.ok) throw new Error("Server error");

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const logOutUser = async () => {
    setIsLoggedIn(false);
    setIsLoggedInGlobal(false);
    localStorage.setItem("isLoggedIn", JSON.stringify(false));

    setIsAdmin(false);
    localStorage.setItem("isAdmin", JSON.stringify(false));

    localStorage.removeItem("token");

    const data2 = {
      message: "Logged-out",
      user_id: "0",
    };

    localStorage.setItem("myData", JSON.stringify(data2));
  };

  const fetchPosts = async (message) => {
    try {
      const res = await fetch(
        "http://localhost:3000/posts?user_id=" + message,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

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

    const token = localStorage.getItem("token");
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

  const checkUser = async (username, password) => {
    console.log("username: " + username);
    console.log("password: " + password);

    try {
      const res = await fetch(
        `http://localhost:3000/users/exists?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
        {
          method: "GET",
        },
      );

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the response
      console.log("Added User: ", data); // do something with it

      setIsLoggedIn(true);
      setIsLoggedInGlobal(true);
      localStorage.setItem("isLoggedIn", JSON.stringify(true));

      localStorage.setItem("token", data.token); // JSON.stringify was causing the token alteration problem. its not necessary and it adds extra quotes

      console.log(
        "token right after storing: " + localStorage.getItem("token"),
      );

      setUname((prevUser) => ({
        ...prevUser,
        name: data.userInfo.username,
        user_id: data.userInfo.id,
      }));

      const data2 = {
        message: data.userInfo.username,
        user_id: data.userInfo.id,
      };

      localStorage.setItem("myData", JSON.stringify(data2));

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const sendFollower = async (username, follower_id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/followers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username,
          follower: uname.name,
          follower_id: uname.user_id,
        }),
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
      const res = await fetch("http://localhost:3000/users?id=" + message, {
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

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "http://localhost:3000/followers?username=" + parsed.message,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the response
      console.log("Fetched users:", data); // do something with it

      setNumfollowers(() => data.count);

      setFollowers(
        data.followers.map((el) => ({
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

  const deletePost = async (post_id) => {
    console.log("delet post method ran");
    const token = localStorage.getItem("token");
    console.log(token);
    try {
      const res = await fetch(
        `http://localhost:3000/posts?post_id=${post_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // {user_id: el.user_id, post_id: el.post_id, reaction: "👍"}

      if (!res.ok) throw new Error("Server error");

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const addReaction = async (data) => {
    console.log("SHOULDBE17: " + data.post_id);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

    const isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn"));
    setIsLoggedIn(isLoggedIn);
    setIsLoggedInGlobal(isLoggedIn);

    const isAdmin = JSON.parse(localStorage.getItem("isAdmin"));
    setIsAdmin(isAdmin);

    const raw = localStorage.getItem("myData");
    console.log("upon refresh: " + localStorage.getItem("myData"));
    console.log("token upon refresh: " + localStorage.getItem("token"));
    let globalid = "0";

    let parsed;
    try {
      if (raw) {
        parsed = JSON.parse(raw); //json string to javascript value
        console.log("parsed is :" + parsed.message);
        // old code used same object not new to set state
        globalid = parsed.user_id;
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

    console.log("parsed.message upon refresh: " + parsed.message);

    fetchUsers(parsed.user_id);
    fetchUserPosts(parsed.message); // unused var uname
    fetchPosts(parsed.user_id);
    fetchFollowers(parsed.message);

    // Connect to the WebSocket server
    socketRef.current = new WebSocket("ws://localhost:8080");

    socketRef.current.onopen = () => {
      console.log("WebSocket connected: !!" + globalid);
      socketRef.current.send(JSON.stringify(globalid));
    };

    socketRef.current.onmessage = (event) => {
      const parsed = JSON.parse(event.data);

      setElements((prev) => [...prev, parsed.msg]);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  const addMessage = () => {
    console.log("Globaltoid upon sending dm: " + globaltoidRef.current);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const messageObject = {
        to: globaltoidRef.current,
        from: uname.user_id,
        msg: input2Text,
      };
      // socketRef.current.send(json.stringify(input2Text));
      socketRef.current.send(JSON.stringify(messageObject));
    }
  };

  return (
    <>
      <div className="page2">
        <div className="page">
          <div className="profileanddms">
            <div className="myprofile">
              <h2>{uname.user_id + " " + uname.name}</h2>
              <div className="followers">
                <span>{numfollowers}</span>&nbsp;
                <span>Followers</span>
              </div>
              <button onClick={() => logOutUser()}>Log out</button>
            </div>
            <div className="dms">
              <div className="dmsprofile">
                <span margins> {dmuname} </span>
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

          <div className="feeds">
            <div className="feed">
              {userPosts.map((el, idx) => (
                <div className="profile" key={idx}>
                  <p className="user">{el.username}</p>
                  <p className="posttext">{el.message}</p>
                  <div className="reactions">
                    <button className="reaction" onClick={() => addReaction()}>
                      👍
                    </button>
                    <button className="reaction" onClick={() => addReaction()}>
                      👎
                    </button>
                    <button>🗑️</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="feed">
              {feed.map((el, idx) => (
                <div className="profile" key={idx}>
                  <p className="user">
                    p#{el.post_id} {el.username}
                  </p>
                  <p className="posttext">{el.message}</p>
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
                    <div>
                      <select
                        onChange={(e) => {
                          const action = e.target.value;
                          setSelected(action);

                          if (action === "delete") {
                            deletePost(el.post_id);
                          } else if (action === "edit") {
                            // handle edit here
                          }
                        }}
                      >
                        <option value="">•••</option>
                        <option value="edit">Edit</option>
                        <option value="delete">Delete</option>
                      </select>

                      {/* {selected && <p>You selected: {selected}</p>} */}
                    </div>
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
            <button
              style={{ display: "none" }}
              onClick={() => fetchFollowers(uname.name)}
            >
              Fetch Followers
            </button>
            <button
              style={{ display: "none" }}
              onClick={() => fetchUserPosts(uname.name)}
            >
              Fetch My Posts
            </button>
            {/* <button onClick= {fetchUsers}>Fetch Users</button> */}
          </div>
        </div>

        <div className="side">
          <div className="login">
            {isLoggedInGlobal ? (
              isAdmin ? (
                <div>
                  <h2>You're logged in as an administrator.</h2>
                </div>
              ) : (
                <div>
                  {" "}
                  <h2>Welcome back!</h2>
                </div>
              )
            ) : (
              <div>
                <span>Log in</span>
                <div>
                  <input
                    className="username"
                    value={uname2}
                    placeholder="username"
                    onChange={(e) => setUname2(e.target.value)}
                  ></input>

                  <input
                    className="username"
                    value={pword}
                    placeholder="password"
                    onChange={(e) => setPword(e.target.value)}
                  ></input>
                </div>

                <div>
                  <div>
                    <button onClick={() => checkUser(uname2, pword)}>
                      Enter
                    </button>
                  </div>
                  <div>
                    <Link to="/signup">Sign up</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Login setUname = {setUname} uname2 = {uname2} setUname2 = {setUname2} pword =  {pword} setPword = {setPword} />

          <div className="followerlist">
            {followers.map((el, idx) => (
              <div className="follower" key={idx}>
                <span>
                  u#{el.follower_id} {el.follower}
                </span>
                <div className="reactions">
                  <button
                    onClick={() => {
                      setDmuname(el.follower);
                      globaltoidRef.current = el.follower_id;
                    }}
                  >
                    message
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="browse">
            {profiles.map((el, idx) => (
              <div className="profile" key={idx}>
                <span>
                  u#{el.id} {el.username}
                </span>
                <div className="reactions">
                  <button onClick={() => sendFollower(el.username, el.id)}>
                    follow
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
