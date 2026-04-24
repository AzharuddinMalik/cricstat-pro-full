import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Minimal async storage shim for this prototype
if (!window.storage) {
  window.storage = {
    async get(key) {
      try {
        const value = window.localStorage.getItem(key);
        return value == null ? null : { value };
      } catch {
        return null;
      }
    },
    async set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // ignore (e.g., private mode / quota)
      }
    }
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

