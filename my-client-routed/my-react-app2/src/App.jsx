import { useEffect, useRef, useState } from "react";
import "./App.css";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Admin from "./components/Admin";

function App() {


  return (
    <>
      <Router>
        <nav className="p-4 flex gap-4 bg-gray-100">
          <Link to="/">Home </Link>
          <Link to="/admin">Admin </Link>
          

        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
