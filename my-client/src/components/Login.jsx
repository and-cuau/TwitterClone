import { useEffect, useRef, useState } from "react";
import "../Admin.css";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Login({
  fetchPosts,
  fetchUserPosts,
  fetchUsers,
  fetchFollowers,
}) {
  const { setUserInfo, userInfo } = useAuth();
  const [uname2, setUname2] = useState();
  const [pword, setPword] = useState();

  const checkUser = async (username, password) => {
    console.log("username: " + username);
    console.log("password: " + password);

    try {
      const res = await fetch(`http://localhost:3000/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the response
      console.log("Added User: ", data); // do something with it

      localStorage.setItem("token", data.token); // JSON.stringify was causing the token alteration problem. its not necessary and it adds extra quotes

      console.log(
        "token right after storing: " + localStorage.getItem("token"),
      );

      setUserInfo((prevUser) => ({
        ...prevUser,
        user_id: data.userInfo.id,
        username: data.userInfo.username,
        role: "user",
      }));

      const data2 = {
        user_id: data.userInfo.id,
        username: data.userInfo.username,
        role: "user",
      };

      localStorage.setItem("userInfo", JSON.stringify(data2));
      fetchUsers(data.userInfo.id);
      fetchUserPosts(data.userInfo.username); // unused var uname
      fetchPosts(data.userInfo.id);
      fetchFollowers(data.userInfo.username);

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  return (
    <div className="login">
      {userInfo ? (
        userInfo.role === "admin" ? (
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
          <h2 className="h2">Log in</h2>
          <div>
            <div>
              <span>Username: </span>
              <input
                className="username"
                value={uname2}
                placeholder="username"
                onChange={(e) => setUname2(e.target.value)}
              ></input>
            </div>

            <div>
              <span>Password: </span>
              <input
                className="username"
                value={pword}
                placeholder="password"
                onChange={(e) => setPword(e.target.value)}
              ></input>
            </div>
          </div>

          <div>
            <div>
              <button
                className="enter"
                onClick={() => checkUser(uname2, pword)}
              >
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
  );
}
