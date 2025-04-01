import React, { useState, useRef } from 'react';

const PDAInput = ({onClose,onSubmit,automataType,theme}) => {
    
    const [pushInput, setPushInput] = useState('');
    const [inputSym, setInputSym] = useState('');
    const [stackTop, setStackTop] = useState('');
    const [PDAfocused, setPDAfocused] = useState(0);
    const inputsymRef = useRef(null);
    const stacktopRef = useRef(null);
    const pushRef = useRef(null);

    const handleClose = () => {
        setPushInput('')
        setInputSym('')
        setStackTop('')
        onClose();
    };
    const handleSubmit = () => {
        if(inputSym===''||stackTop===''||pushInput==='') return
        onSubmit(`${inputSym},${stackTop}/${pushInput}`);
        setPushInput('')
        setInputSym('')
        setStackTop('')
        onClose();
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

    function epsilonclick(){
        if(automataType==="NPDA"){
          if(PDAfocused===0){
            inputsymRef.current.focus()
            setInputSym('ε')
          }else if(PDAfocused===2){
            pushRef.current.focus()
            setPushInput(`ε`)
          }
        }else{
          pushRef.current.focus()
          setPushInput('ε')
        }
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
    return(
        <>
        <input
            ref={inputsymRef}
            value={inputSym}
            type="text"
            placeholder='input'
            spellCheck="false"
            name='inputsym'
            style={{
                width: '18%',
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1em',
                backgroundColor:theme.background,
                color:theme.black,
            }}
            autoFocus
            onChange={handleInputsymChange}
            onFocus={() => { setPDAfocused(0); }}
        />
        <span style={{ fontSize: '18px',color:theme.black }}> , </span>
        <input
            ref={stacktopRef}
            type="text"
            placeholder='stacktop'
            value={stackTop}
            spellCheck="false"
            name='stacktop'
            onChange={handleStackTopChange}
            style={{
                width: '18%',
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1em',
                backgroundColor:theme.background,
                color:theme.black,
            }}
            onFocus={() => { setPDAfocused(1); }}
        />
        <span style={{ fontSize: '18px',color:theme.black }}> / </span>
        <input
            ref={pushRef}
            placeholder='push'
            type="text"
            value={pushInput}
            spellCheck="false"
            name='push'
            onChange={handlePushChange}
            style={{
                color:theme.black,
                width: '18%',
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1em',
                backgroundColor:theme.background
            }}
            onFocus={() => { setPDAfocused(2); }}
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
              onClick={epsilonclick}
            >
              ε epsilon
            </button>
            <button 
              style={{
                width: '30%',
                border: '1px solid rgb(154, 154, 154)',
                padding: '5px',
                borderRadius:'4px', 
                cursor:'pointer', 
                transition:'opacity .3s ease',
                color:theme.black,
                backgroundColor:theme.background
              }}
              onClick={z0click}
            >
              z₀
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
        </>
    )
}

export default PDAInput