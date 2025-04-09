import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../FireBase/firebase";
import { signOut } from "firebase/auth";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to log out. Try again.");
    }
  };

  return (
    <nav className="navbar">
      {user && (
        <div className="nav-content">
          <div className="drop-content" ref={dropdownRef}>
            <img
              src={user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="User Avatar"
              className="avatar"
              onClick={() => setDropdownOpen((prev) => !prev)}
            />
            {dropdownOpen && (
              <div className="dropdown-menu-custom">
                
                <div className="dropdown-header">
                  <img
                    src={user.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="User Avatar"
                    className="avatar dropdown-avatar"
                  />
                  <div className="user-name">{user.displayName || "User Name"}</div>
                </div>
                <div className="dropdown-item">
                  <span className="material-symbols-rounded">person</span>
                  Profile
                </div>
                <div className="dropdown-item">
                  <span className="material-symbols-rounded">settings</span>
                  Settings
                </div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
