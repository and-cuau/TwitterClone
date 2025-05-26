import { useEffect, useRef, useState } from "react";
import "../Admin.css";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const [newusername, setNewusername] = useState("");
  const [newpassword, setNewpassword] = useState("");

  const [uname, setUname] = useState("");
  const [pword, setPword] = useState("");

  const { setIsAdmin, isAdmin } = useAuth();
  const { setIsLoggedInGlobal, isLoggedInGlobal } = useAuth();

  const { setUserInfo, userInfo } = useAuth();

  const sendUser = async () => {
    try {
      const res = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newusername,
          password: newpassword,
          role: "admin",
        }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the response
      console.log("Added User: ", data); // do something with it

      // uname.user_id = data.id;
      // setUname(uname);

      //   setUname((prevUser) => ({
      //     ...prevUser,
      //     name: message,
      //     user_id: data.id,
      //   }));

      //   const data2 = {
      //     message: message,
      //     user_id: data.id,
      //   };

      //   localStorage.setItem("myData", JSON.stringify(data2));

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
      const res = await fetch(`http://localhost:3000/users/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
      });

      const data = await res.json(); // parse the response
      console.log("Added User: ", data); // do something with it

      if (res.ok) {
        console.log("Login successful:", data);

        localStorage.setItem("token", data.token); // JSON.stringify was causing the token alteration problem. its not necessary and it adds extra quotes

        const data2 = {
          user_id: data.userInfo.id,
          username: data.userInfo.username,
          role: "admin",
        };

        localStorage.setItem("userInfo", JSON.stringify(data2));

        return { success: true, data }; // contains userInfo + token
      } else {
        console.warn("Login failed:", data.error);
        return { success: false, error: data.error };
      }

      // return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  return (
    <>
      <h1>Admin</h1>

      <div className="doublepanel">
        <div className="panel">
          <h2>Sign up</h2>

          <p>New username:</p>
          <input
            className="createuname"
            placeholder="username"
            value={newusername}
            onChange={(e) => setNewusername(e.target.value)}
          ></input>

          <p>New password:</p>
          <input
            className="createpword"
            placeholder="password"
            value={newpassword}
            onChange={(e) => setNewpassword(e.target.value)}
          ></input>
          <button onClick={() => sendUser()}>Enter</button>
        </div>

        <div className="panel">
          <h2>Log in</h2>
          <p>Username:</p>
          <input
            className="createuname"
            placeholder="username"
            value={uname}
            onChange={(e) => setUname(e.target.value)}
          ></input>

          <p>Password:</p>

          <input
            className="createpword"
            placeholder="password"
            value={pword}
            onChange={(e) => setPword(e.target.value)}
          ></input>
          <button onClick={() => checkUser(uname, pword)}>Enter</button>
        </div>
      </div>
    </>
  );
}
