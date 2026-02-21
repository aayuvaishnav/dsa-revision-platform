import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../FireBase/firebase";
import { signOut } from "firebase/auth";
import "./Navbar.css";
import { useToast } from "./Toast";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();
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
      toast.error("Failed to log out. Try again.");
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-icon">⚡</div>
        <span className="nav-brand-name">DSA Tracker</span>
      </div>
      {user && (
        <div className="nav-content">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
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
                  <div className="user-name">{user.displayName || "User"}</div>
                  {user.email && <div className="user-email">{user.email}</div>}
                </div>
                <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="material-symbols-rounded">settings</span>
                  Settings
                </Link>
                <div className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <span className="material-symbols-rounded">person</span>
                  Profile
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
