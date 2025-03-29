import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { auth } from "../FireBase/firebase";
import { signOut } from "firebase/auth";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
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
      <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
    </nav>
  );
};

export default Navbar;
