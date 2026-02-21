import { auth, googleProvider } from "../FireBase/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useToast } from "./Toast";

const SocialLogIn = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Google Login Successful!");
      navigate("/homepage");
    } catch (error) {
      console.error("Google Login Error:", error.message);
      toast.error("Google Login Failed. Try again!");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="social-login">
      <button className="social-button" onClick={handleGoogleLogin} disabled={googleLoading}>
        <img src={`${process.env.PUBLIC_URL}/google.svg`} alt="Google" className="social-icon" />
        {googleLoading ? "Signing in..." : "Google"}
      </button>
    </div>
  );
};

export default SocialLogIn;
