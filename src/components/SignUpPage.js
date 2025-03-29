import React, { useState } from "react";
import { auth } from "../FireBase/firebase"; 
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "./SignUpPage.css";
import InputField from "./InputField";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signUp = async (event) => {
    event.preventDefault(); 

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      
      await updateProfile(user, { displayName: name });

      alert("Sign Up Successful!");
      navigate("/"); 
    } catch (error) {
      console.error("Sign Up Error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="form-title">Sign Up</h2>
      <form className="signup-form" onSubmit={signUp}>
        <InputField
          type="text"
          placeholder="Full Name"
          icon="person"
          onChange={(event) => setName(event.target.value)}
          required
        />
        <InputField
          type="email"
          placeholder="Email Address"
          icon="mail"
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <InputField
          type="password"
          placeholder="Password"
          icon="lock"
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button className="signup-button" type="submit">
          Sign Up
        </button>
      </form>
      <p className="login-text">
        Already have an account?
        <Link to="/"> Log In Now</Link>
      </p>
    </div>
  );
};

export default SignUpPage;
