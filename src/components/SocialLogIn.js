import { auth, googleProvider } from "../FireBase/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import React from "react";

const SocialLogIn = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Google Login Successful!");
      navigate("/homepage");
    } catch (error) {
      console.error("Google Login Error:", error.message);
      alert("Google Login Failed. Try again!");
    }
  };

  return (
    <div className="social-login">
      <button className="social-button" onClick={handleGoogleLogin}>
        <img src="google.svg" alt="Google" className="social-icon" />
        Google
      </button>
    </div>
  );
};

export default SocialLogIn;
