import { useEffect, useRef, useState } from "react";
import "../App.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";

export default function Home() {
  const [selected, setSelected] = useState("");
  const [inputText, setInputText] = useState("");
  const [input2Text, setInput2Text] = useState("");
  // const [uname, setUname] = useState({ name: "test", user_id: "" });
  const [numfollowers, setNumfollowers] = useState("-1");
  const globaltoidRef = useRef(null);
  const [profiles, setProfiles] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [feed, setFeed] = useState([
    { username: "Dex", message: "good morning" },
    { username: "Luna", message: "hello world" },
  ]);
  const [userPosts, setUserPosts] = useState([]);

  const { userInfo, setUserInfo } = useAuth(); // NEW!

  const sendPost = async (message) => {
    const token = localStorage.getItem("token");
    console.log("token on sending post" + token);

    // const raw = localStorage.getItem("userInfo"); // jank fix
    // const parsed = JSON.parse(raw);

    try {
      const res = await fetch("http://localhost:3000/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // <<< Added Auth line
        },
        body: JSON.stringify({
          user_id: userInfo.user_id,
          username: userInfo.username,
          text: message,
        }),
      });

      if (!res.ok) throw new Error("Server error");

      fetchPosts(userInfo.user_id); // added fetchpost but not fetchuserposts
      fetchUserPosts(userInfo.username); // necessary?

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  const logOutUser = async () => {
    setUserInfo(null); // NEW!
    localStorage.removeItem("userInfo"); // NEW!

    localStorage.removeItem("token");
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
    const raw = localStorage.getItem("userInfo"); // jank fix
    const parsed = JSON.parse(raw);
    console.log("TEST:" + parsed.username);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "http://localhost:3000/posts/user?username=" + parsed.username,
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
          follower: userInfo.username,
          follower_id: userInfo.user_id,
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
    console.log("MESSAGE TEST" + message);
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
    const raw = localStorage.getItem("userInfo"); // jank fix
    const parsed = JSON.parse(raw);

    console.log("this is what sent to /followers: " + parsed.username);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "http://localhost:3000/followers?username=" + parsed.username,
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
      ); // idk why the old code wasnt working but this suggested code is much cleaner

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

  

  useEffect(() => {
    const userInformation = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(userInformation);

    if (userInfo) {
      const raw = localStorage.getItem("userInfo");
      console.log("upon refresh: " + localStorage.getItem("userInfo"));
      console.log("token upon refresh: " + localStorage.getItem("token"));
      let globalid = "0";

      let parsed;
      try {
        if (raw) {
          parsed = JSON.parse(raw); //json string to javascript value
          console.log("parsed is :" + parsed.username);
          // old code used same object not new to set state
          globalid = parsed.user_id;
          setUserInfo((prevUser) => ({
            ...prevUser,
            user_id: parsed.user_id,
            username: parsed.username,
            role: parsed.role,
          }));

          console.log("if passed");
        } else {
          console.log("no saved data");
        }

        fetchUsers(parsed.user_id);
        fetchUserPosts(parsed.username); // unused var uname
        fetchPosts(parsed.user_id);
        fetchFollowers(parsed.username);
      } catch (e) {
        console.error("Failed to parse localStorage data:", e);
      }

      // console.log("parsed.username upon refresh: " + parsed.username);
    }
  }, []);

  return (
    <>
      <div className="page2">
        <div className="page">
          <div className="myprofile">
            {userInfo ? (
              <div>
                <h2>{userInfo.user_id + " " + userInfo.username}</h2>
                <div className="followers">
                  <span>{numfollowers}</span>&nbsp;
                  <span>Followers</span>
                </div>
                <button onClick={() => logOutUser()}>Log out</button>
              </div>
            ) : (
              <div>
                <h2>You are logged out.</h2>
              </div>
            )}
          </div>

          <div className="feeds">
            <div className="feedwrapper">
              <h2 className="h2">Your Posts</h2>
              <div className="feed">
                {userPosts.map((el, idx) => (
                  <div className="post" key={idx}>
                    <p className="user">{el.username}</p>
                    <p className="posttext">{el.message}</p>
                    <div className="reactions">
                      <button
                        className="reaction"
                        onClick={() => addReaction()}
                      >
                        👍
                      </button>
                      <button
                        className="reaction"
                        onClick={() => addReaction()}
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

            <div className="feedwrapper">
              <h2 className="h2">Feed</h2>
              <div className="feed">
                {feed.map((el, idx) => (
                  <div className="post" key={idx}>
                    <p className="user">
                      p#{el.post_id} {el.username}
                    </p>
                    <p className="posttext">{el.message}</p>
                    <div className="reactions">
                      <button
                        className="reaction"
                        onClick={() =>
                          addReaction({
                            user_id: userInfo.user_id,
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
                            user_id: userInfo.user_id,
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
              onClick={() => fetchFollowers(userInfo.username)}
            >
              Fetch Followers
            </button>
            <button
              style={{ display: "none" }}
              onClick={() => fetchUserPosts(userInfo.username)}
            >
              Fetch My Posts
            </button>
            {/* <button onClick= {fetchUsers}>Fetch Users</button> */}
          </div>
        </div>

        <div className="side">
          <Login
            setUserInfo={setUserInfo}
            fetchPosts={fetchPosts}
            fetchUserPosts={fetchUserPosts}
            fetchUsers={fetchUsers}
            fetchFollowers={fetchFollowers}
          />
          <div className="followerlist">
            <h2 className="h2">Followers</h2>
            {followers.map((el, idx) => (
              <div className="profile" key={idx}>
                <span>
                  u#{el.follower_id} {el.follower}
                </span>
                <div className="reactions">
                  <Link to="/messages" state={{ toUserIDProp: el.follower_id, toUserProp: el.follower }}>
                    Message
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="browse">
            <h2 className="h2">Browse Users</h2>
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
