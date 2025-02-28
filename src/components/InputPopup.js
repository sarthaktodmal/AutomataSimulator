import React, { useState } from 'react';
import styles from "./InputPopup.module.css";

const InputPopup = ({ isOpen, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(inputValue);
    setInputValue('')
    onClose();
  };

  const handleClose = () => {
    setInputValue('')
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <h3 className={styles.popupTitle}>Enter Transition Symbol</h3>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className={styles.popupInput}
          autoFocus
        />
        <div className={styles.popupButtons}>
          <button onClick={handleSubmit} className={styles.popupButton}>
            Submit
          </button>
          <button onClick={handleClose} className={styles.popupButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputPopup;