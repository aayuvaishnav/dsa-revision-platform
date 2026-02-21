import React from "react";

const FirebaseConfigNeeded = () => (
  <div
    style={{
      padding: "2rem",
      maxWidth: "560px",
      margin: "2rem auto",
      fontFamily: "system-ui, sans-serif",
      lineHeight: 1.6,
    }}
  >
    <h1 style={{ color: "#c62828", marginBottom: "1rem" }}>
      Firebase not configured
    </h1>
    <p>
      <strong>auth/invalid-api-key</strong> means the app is running without
      valid Firebase credentials. Add a <code>.env</code> file in the project root
      with your Firebase config, then <strong>restart the dev server</strong> (Ctrl+C, then <code>npm start</code>).
    </p>
    <p style={{ background: "#fff3e0", padding: "0.75rem", borderRadius: "6px" }}>
      If you already have a <code>.env</code>: use the exact API key from Firebase Console (Project settings → Your apps). No quotes around values, no extra spaces. Restart the dev server after any change to <code>.env</code>.
    </p>
    <h2 style={{ fontSize: "1rem", marginTop: "1.5rem" }}>Steps</h2>
    <ol style={{ paddingLeft: "1.25rem" }}>
      <li>In Firebase Console, open your project → Project settings → General.</li>
      <li>Under “Your apps”, copy the config (or the individual keys).</li>
      <li>In the project root, create a file named <code>.env</code> (no extension).</li>
      <li>Add these lines (replace with your real values):
        <pre
          style={{
            background: "#f5f5f5",
            padding: "1rem",
            borderRadius: "8px",
            overflow: "auto",
            fontSize: "0.85rem",
            marginTop: "0.5rem",
          }}
        >
{`REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123`}
        </pre>
      </li>
      <li>Stop the dev server (Ctrl+C) and run <code>npm start</code> again.</li>
    </ol>
    <p style={{ marginTop: "1.5rem", color: "#555" }}>
      You can copy from <code>.env.example</code> in the project if it exists.
    </p>
  </div>
);

export default FirebaseConfigNeeded;
