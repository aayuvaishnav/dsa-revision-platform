import React, { useState } from "react";
import { auth } from "../FireBase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "./SignUpPage.css";
import InputField from "./InputField";
import { useToast } from "./Toast";

const SignUpPage = () => {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const navigate = useNavigate();

  const signUp = async (event) => {
    event.preventDefault();

    setSignUpLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;


      await updateProfile(user, { displayName: name });

      toast.success("Sign Up Successful!");
      navigate("/");
    } catch (error) {
      console.error("Sign Up Error:", error.message);
      toast.error(error.message);
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="signup-page">
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
          <button className="signup-button" type="submit" disabled={signUpLoading}>
            {signUpLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <p className="login-text">
          Already have an account?
          <Link to="/"> Log In Now</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
