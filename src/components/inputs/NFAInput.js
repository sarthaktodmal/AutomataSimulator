import React, { useState, useRef } from 'react';

const NFAInput = ({onClose,onSubmit,theme}) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    const handleClose = () => {
        setInputValue('')
        onClose();
    };
    //format 1,2,3
    const handleChange = (event) => {
        const rawValue = event.target.value;
        const cleanedValue = rawValue.replace(/,/g, '');
        const formattedValue = [...new Set(cleanedValue.split(''))].join(',');
        setInputValue(formattedValue);
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
    const epsilon = () => {
        if (inputRef.current) inputRef.current.focus();
        if (inputValue.toString().split('').includes('ε')) return
        CustomCommadInput(setInputValue,inputValue,'ε')
    }
    function CustomCommadInput(setTarget,target,input){
      if (target!=='') {
        setTarget((prev) => `${prev},${input}`)
      }
      else setInputValue(input)
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
          onChange={(e) => handleChange(e)}
          style={{
            backgroundColor:theme.background,
            color:theme.black,
            width: '80%',
            padding: '10px',
            marginBottom: '15px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1em',
          }}
          autoFocus
        />
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginBottom: '15px'
        }}>
            <button 
              style={{
                width: '30%',
                border: '1px solid rgb(154, 154, 154)',
                padding: '5px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition:'opacity .3s ease',
                color:theme.black,
                backgroundColor:theme.background
              }}
              onClick={epsilon}
            >
              ε epsilon
            </button>

        </div>
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

export default NFAInput