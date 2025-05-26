import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="p-4 flex gap-4 bg-gray-100">
      <Link to="/">Home </Link>
      <Link to="/messages" state={{ toUserProp: "test" }}>
        Messages
      </Link>
      <Link to="/admin">Admin </Link>
    </nav>
  );
};

export default Navbar;
