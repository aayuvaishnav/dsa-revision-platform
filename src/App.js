import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LogInPage from "./components/LogInPage";
import SignUpPage from "./components/SignUpPage";
import HomePage from "./components/HomePage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="homepage" element={< HomePage />}/>
      </Routes>
    </Router>
  );
}

export default App;
