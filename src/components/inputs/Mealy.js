import React, { useState, useRef } from 'react';

export const MealyInput = ({onClose,onSubmit,theme}) => {
    const [inputMealy, setInputMealy] = useState('');
    const [outputMealy, setOutputMealy] = useState('');

    const handleClose = () => {
        setInputMealy('')
        setOutputMealy('')
        onClose();
    };

    const handleSubmit = () => {
        if(inputMealy===''||outputMealy==='') return
        onSubmit(`${inputMealy}/${outputMealy}`)
        setInputMealy('')
        setOutputMealy('')
        onClose();
    }

    return(
        <>
        <input
            type="text"
            value={inputMealy}
            spellCheck="false"
            name='inputmealy'
            placeholder='input'
            maxLength={1}
            onChange={(e)=>setInputMealy(e.target.value)}
            style={{
                backgroundColor:theme.background,
                color:theme.black,
                width: '30%',
                padding: '10px',
                marginBottom: '25px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1em',
            }}
            autoFocus
        />
        <span style={{ fontSize: '18px',color:theme.black }}> / </span>
        <input
            type="text"
            value={outputMealy}
            spellCheck="false"
            name='outputmealy'
            placeholder='output'
            maxLength={1}
            onChange={(e)=>setOutputMealy(e.target.value)}
            style={{
                backgroundColor:theme.background,
                color:theme.black,
                width: '30%',
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1em',
            }}
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
        </>
    )
}

export default MealyInput