import React, { useState, useRef } from 'react';
import styles from "./InputPopup.module.css";

const InputPopup = ({ isOpen, onClose, onSubmit,automataType }) => {
  const [inputValue, setInputValue] = useState('');
  const [pushInput, setPushInput] = useState('');
  const [inputSym, setInputSym] = useState('');
  const [stackTop, setStackTop] = useState('');
  const [PDAfocused, setPDAfocused] = useState(0);

  const inputRef = useRef(null);
  const inputsymRef = useRef(null);
  const stacktopRef = useRef(null);
  const pushRef = useRef(null);

  const handleClose = () => {
    setInputValue('')
    setPushInput('')
    setInputSym('')
    setStackTop('')
    onClose();
  };

  const handleSubmit = () => {
    if (inputRef.current && inputValue === "") {
      inputRef.current.focus();
      return
    }
    if(automataType==="DPDA"){
      if(inputSym===''||stackTop===''||pushInput==='') return
      onSubmit(`${inputSym},${stackTop}/${pushInput}`);
    }else{
      onSubmit(inputValue);
    }
    setInputValue('')
    setPushInput('')
    setInputSym('')
    setStackTop('')
    onClose();
  };

  //format 1,2,3
  const handleChange = (event,stateHook) => {
    const rawValue = event.target.value;
    const cleanedValue = rawValue.replace(/,/g, '');
    const formattedValue = cleanedValue.split('').join(',');
    stateHook(formattedValue);
  };
  //NFA
  const epsilon = () => {
    if (inputRef.current) inputRef.current.focus();
    if (inputValue.toString().split('').includes('ε')) return
    CustomCommadInput(setInputValue,inputValue,'ε')
  }

  //PDA
  const handlePushChange = (event) => {
    const value = typeof event === 'string' ? event : event.target.value; //to allow z0click to insert z₀
    if (value.includes('ε')) return;
    const cleanedValue = value.replace(/,/g, '').match(/z₀|./g);
    const formattedValue = cleanedValue ? cleanedValue.join(',') : '';
    setPushInput(formattedValue);
  };
  const handleInputsymChange = (event) => {
    if(inputSym.length===0 || event.target.value===''){
      setInputSym(event.target.value)
    }
  };
  const handleStackTopChange = (event) => {
    if(stackTop.length===0 || event.target.value===''){
      setStackTop(event.target.value)
    }
    if(event.target.value==='z' && stackTop==='z₀'){
      setStackTop('')
      setPDAfocused(1)
    }
  };

  //PDA EXTRA INPUT ε z₀
  function epsilonclick(){
    pushRef.current.focus()
    setPushInput('ε')
  }
  function z0click(){
    if(PDAfocused===1){
      stacktopRef.current.focus()
      setStackTop('z₀')
    }else if(PDAfocused===2){
      pushRef.current.focus()
      handlePushChange(`${pushInput}z₀`)
    }
  }

  function CustomCommadInput(setTarget,target,input){
    if (target!=='') {
      setTarget((prev) => `${prev},${input}`)
    }
    else setInputValue(input)
  }

  if (!isOpen) {
    return null;
  }
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <h3 className={styles.popupTitle}>Enter Transition Symbol for {automataType}</h3>
        {automataType==="DPDA"?
        <>
          <input
          ref={inputsymRef}
          value={inputSym}
          type="text"
          placeholder='input'
          className={styles.popupInputForPDA}
          autoFocus
          onChange={handleInputsymChange}
          onFocus={()=>{setPDAfocused(0)}}
        />
        <span style={{fontSize: 18,}}> , </span>
         <input
          ref={stacktopRef}
          type="text"
          placeholder='stacktop'
          value={stackTop}
          onChange={handleStackTopChange}
          className={styles.popupInputForPDA}
          onFocus={()=>{setPDAfocused(1)}}
        />
          <span style={{fontSize: 18,}}> / </span>
         <input
          ref={pushRef}
          placeholder='push'
          type="text"
          value={pushInput}
          onChange={handlePushChange}
          className={styles.popupInputForPDA}
          onFocus={()=>{setPDAfocused(2)}}
        />
        </>
          :
          <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e)=>handleChange(e,setInputValue)}
          className={styles.popupInput}
          autoFocus
        />}
        <div className={styles.specialInputDiv}>
          {(automataType==="NFA"||automataType==="DPDA")&&
            <button onClick={automataType==="DPDA"?epsilonclick:epsilon} className={styles.epsilonButt}>
            ε epsilon
            </button>
          }
          {automataType==="DPDA"&&
            <button onClick={z0click} className={styles.epsilonButt}>
            z₀
            </button>
          }
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