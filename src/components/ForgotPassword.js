import React, { useState } from "react";
import { auth } from "../FireBase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";
import { useToast } from "./Toast";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
      toast.success("Check your email for the reset link.");
    } catch (error) {
      console.error("Reset error:", error);
      if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address.");
      } else {
        toast.error(error.message || "Failed to send reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="forgot-container">
        <div className="forgot-card">
          <h2>Check your email</h2>
          <p>We sent a password reset link to <strong>{email}</strong>.</p>
          <p className="forgot-hint">Didn’t get it? Check spam or try again.</p>
          <Link to="/" className="forgot-back">Back to Log in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <h2>Forgot password?</h2>
        <p className="forgot-desc">Enter your email and we’ll send you a link to reset your password.</p>
        <form onSubmit={handleSubmit} className="forgot-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="forgot-input"
            required
          />
          <button type="submit" className="forgot-submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <Link to="/" className="forgot-back">Back to Log in</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
