import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "../FireBase/firebase";
import Navbar from "./Navbar";
import { useTheme } from "../context/ThemeContext";
import { getRevisionDays, setRevisionDays, REVISION_DAY_OPTIONS } from "../utils/settings";
import "./SettingsPage.css";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const [revisionDays, setRevisionDaysState] = useState(getRevisionDays());

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
