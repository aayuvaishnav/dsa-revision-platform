import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LogInPage from "./components/LogInPage";
import SignUpPage from "./components/SignUpPage";
import HomePage from "./components/HomePage";
import ForgotPassword from "./components/ForgotPassword";
import SettingsPage from "./components/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="homepage"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
