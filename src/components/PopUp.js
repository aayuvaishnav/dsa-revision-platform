import React from "react";
import "./PopUp.css";

const Popup = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <div className="popup-content">{children}</div>
      </div>
    </div>
  );
};

export default Popup;
