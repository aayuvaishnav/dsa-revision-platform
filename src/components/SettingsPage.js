import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "../FireBase/firebase";
import Navbar from "./Navbar";
import { useTheme } from "../context/ThemeContext";
import { getRevisionDays, setRevisionDays, REVISION_DAY_OPTIONS } from "../utils/settings";
import { getGeminiApiKey, setGeminiApiKey } from "../utils/gemini";
import { useToast } from "./Toast";
import "./SettingsPage.css";

const SettingsPage = () => {
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [revisionDays, setRevisionDaysState] = useState(getRevisionDays());
  const [apiKey, setApiKeyState] = useState(getGeminiApiKey());
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setRevisionDaysState(getRevisionDays());
  }, []);

  const handleRevisionDaysChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setRevisionDays(value);
    setRevisionDaysState(value);
  };

  const user = auth?.currentUser;

  return (
    <div className="settings-page">
      <Navbar />
      <div className="settings-container">
        <h1 className="settings-title">Settings</h1>
        <div className="settings-section">
          <h2>Appearance</h2>
          <label className="settings-label">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="settings-select"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="settings-section">
          <h2>Revision</h2>
          <label className="settings-label">Consider &quot;due for revision&quot; after (days)</label>
          <select
            value={revisionDays}
            onChange={handleRevisionDaysChange}
            className="settings-select"
          >
            {REVISION_DAY_OPTIONS.map((d) => (
              <option key={d} value={d}>{d} days</option>
            ))}
          </select>
        </div>
        <div className="settings-section">
          <h2>AI Assistant</h2>
          <label className="settings-label">Gemini API Key</label>
          <p className="settings-hint">Get a free key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></p>
          <div className="api-key-row">
            <input
              type={showApiKey ? "text" : "password"}
              className="api-key-input"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKeyState(e.target.value)}
            />
            <button
              type="button"
              className="api-key-toggle"
              onClick={() => setShowApiKey(!showApiKey)}
              title={showApiKey ? "Hide" : "Show"}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
                {showApiKey ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          <button
            className="api-key-save"
            onClick={() => {
              setGeminiApiKey(apiKey);
              toast.success(apiKey ? "API key saved!" : "API key removed.");
            }}
          >
            {apiKey ? "Save Key" : "Clear Key"}
          </button>
        </div>
        {user && (
          <div className="settings-section">
            <h2>Account</h2>
            <p className="settings-account-row"><strong>Email</strong> {user.email}</p>
            <p className="settings-account-row"><strong>Name</strong> {user.displayName || "—"}</p>
          </div>
        )}
        <Link to="/homepage" className="settings-back">Back to Home</Link>
      </div>
    </div>
  );
};

export default SettingsPage;
