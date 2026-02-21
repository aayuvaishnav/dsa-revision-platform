import React, { useState } from "react";
import { auth } from "../FireBase/firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "./LogInPage.css";
import SocialLogIn from "./SocialLogIn";
import InputField from "./InputField";
import { useToast } from "./Toast";

const LogInPage = () => {
  const toast = useToast();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate(); 
  const login = async (event) => {
    event.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error("Please fill in all fields!");
      return;
    }
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      toast.success("Login Successful!");
      navigate("/homepage");
    } catch (error) {
      console.error("Login Error:", error.message);
      toast.error("Invalid email or password");
    } finally {
      setLoginLoading(false);
    }
};
  return (
    <div className="login-page">
      <div className="login-hero">
        <h1 className="login-hero-title">DSA Revision Platform</h1>
        <p className="login-hero-desc">Track your practice, revise by topic, and never lose a problem again.</p>
        <ul className="login-hero-features">
          <li>Save questions by topic & difficulty</li>
          <li>Get random problems for quick practice</li>
          <li>Due-for-revision reminders</li>
        </ul>
      </div>
      <div className="login-container">
        <h2 className="form-title">Log in</h2>
        <SocialLogIn />
      <p className="separator">
        <span>Or</span>
      </p>
      
      <form className="login-form" onSubmit={login}>
        <InputField
          type="email"
          placeholder="Email Address"
          icon="mail"
          onChange={(event) => setLoginEmail(event.target.value)}
          required
        />
        <InputField
          type="password"
          placeholder="Password"
          icon="lock"
          onChange={(event) => setLoginPassword(event.target.value)}
          required
        />
        <Link to="/forgot-password" className="Forgot-Pass-Link">
          Forgot Password?
        </Link>
        <button className="login-button" type="submit" disabled={loginLoading}>
          {loginLoading ? "Logging in..." : "Log In"}
        </button>
      </form>
      <p className="signup-text">
        Don't have an account?
        <Link to="/signup"> Sign Up Now</Link>
      </p>
      </div>
    </div>
  );
};

export default LogInPage;
