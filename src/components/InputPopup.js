import React, { useState, useRef } from 'react';
import styles from "./InputPopup.module.css";

const InputPopup = ({ isOpen, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value.trim());
  };

  const handleSubmit = () => {
    if (inputRef.current && inputValue === "") {
      inputRef.current.focus();
      return
    }
    onSubmit(inputValue);
    setInputValue('')
    onClose();
  };

  const handleClose = () => {
    setInputValue('')
    onClose();
  };

  const handleepsilon = () => {
    if (inputRef.current) inputRef.current.focus();
    if (inputValue.toString().split('').includes('ε')) return

    if (inputValue) {
      if (inputValue.charAt(inputValue.length - 1) !== ',')
        setInputValue((prev) => `${prev},ε`)
      else
        setInputValue((prev) => `${prev}ε`)
    }
    else setInputValue("ε")
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <h3 className={styles.popupTitle}>Enter Transition Symbol</h3>
        <div className={styles.inputDiv}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className={styles.popupInput}
            autoFocus
          />
          <button onClick={handleepsilon} className={styles.epsilonButt}>
            ε epsilon
          </button>
        </div>

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