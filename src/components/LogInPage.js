import React, { useState } from "react";
import { auth } from "../FireBase/firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link} from "react-router-dom";
import "./LogInPage.css";
import SocialLogIn from "./SocialLogIn";
import InputField from "./InputField";

const LogInPage = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const navigate = useNavigate(); 
  const login = async (event) => {
    event.preventDefault(); 

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      alert("Login Successful!");
      navigate("/homepage"); 
    } catch (error) {
      console.error("Login Error:", error.message);
      alert("Invalid email or password");
    }
  };

  return (
    <div className="login-container">
      <h2 className="form-title">Log in With</h2>
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
        <a href="#" className="Forgot-Pass-Link">
          Forgot Password?
        </a>
        <button className="login-button" type="submit"
        onClick={()=> {navigate("/homepage")}}>
          Log In
        </button>
      </form>
      <p className="signup-text">
        Don't have an account?
        <Link to="/signup"> Sign Up Now</Link>
      </p>
    </div>
  );
};

export default LogInPage;
