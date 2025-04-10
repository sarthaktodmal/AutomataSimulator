import React, { useState, useRef } from 'react';

const MooreInput = ({onClose,onSubmit,theme}) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    const handleClose = () => {
        setInputValue('')
        onClose();
    };
    //format 1,2,3
    const handleChange = (event,stateHook) => {
        const rawValue = event.target.value;
        const cleanedValue = rawValue.replace(/,/g, '');
        const formattedValue = [...new Set(cleanedValue.split(''))].join(',');
        stateHook(formattedValue);
    };
    const handleSubmit = () => {
        if (inputRef.current && inputValue === "") {
        inputRef.current.focus();
        return
        }
        onSubmit(inputValue);
        setInputValue('')
        onClose();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    return(
        <div onKeyDown={handleKeyDown}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          spellCheck="false"
          autoComplete="off"
          name='input'
          onChange={(e) => handleChange(e, setInputValue)}
          style={{
            backgroundColor:theme.background,
            color:theme.black,
            width: '80%',
            padding: '10px',
            marginBottom: '25px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1em',
          }}
          autoFocus
        />

        <div style={{
          display:'flex', 
          justifyContent:'space-around', 
          gap:'10px'
        }}>
          <button 
            onClick={handleSubmit}
            style={{
              padding:'15px', 
              border:'none', 
              fontSize:'16px', 
              cursor:'pointer', 
              backgroundColor:'#1877F2', 
              color:'white', 
              width:'50%', 
              borderBottomLeftRadius:'8px'
            }}
          >
            Submit
          </button>
          <button 
            onClick={handleClose} 
            style={{
               padding:'15px', 
               border:'none', 
               fontSize:'16px', 
               cursor:'pointer', 
               backgroundColor:theme.background, 
               color:theme.black, 
               width:'50%', 
               borderBottomRightRadius:'8px'
             }}
           >
             Cancel
           </button>
        </div>
        </div>
    )
}
export default MooreInput