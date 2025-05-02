import { useEffect, useRef, useState } from "react";

export default function Signup() {
  const [newusername, setNewusername] = useState("");
  const [newpassword, setNewpassword] = useState("");

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
          role: "user",
        }),
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json(); // parse the response
      console.log("Added User: ", data); // do something with it

      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      return false;
    }
  };

  return (
    <>
      <h1>Sign up</h1>

      <div>
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
      </div>

      <button onClick={() => sendUser()}>Enter</button>
    </>
  );
}
