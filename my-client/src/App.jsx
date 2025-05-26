import { useEffect, useRef, useState } from "react";
import "./App.css";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Admin from "./components/Admin";
import Navbar from "./components/Navbar";
import Messages from "./components/Messages";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
