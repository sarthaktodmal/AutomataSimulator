import React, { useState, useRef } from 'react';

const InputPopup = ({ isOpen, onClose, onSubmit,automataType,theme }) => {
  const [inputValue, setInputValue] = useState('');

  //PDA
  const [pushInput, setPushInput] = useState('');
  const [inputSym, setInputSym] = useState('');
  const [stackTop, setStackTop] = useState('');
  const [PDAfocused, setPDAfocused] = useState(0);
  const inputRef = useRef(null);
  const inputsymRef = useRef(null);
  const stacktopRef = useRef(null);
  const pushRef = useRef(null);

  //MEaly
  const [inputMealy, setInputMealy] = useState('');
  const [outputMealy, setOutputMealy] = useState('');

  const handleClose = () => {
    setInputValue('')
    setPushInput('')
    setInputSym('')
    setStackTop('')
    setInputMealy('')
    setOutputMealy('')
    onClose();
  };

  const handleSubmit = () => {
    if (inputRef.current && inputValue === "") {
      inputRef.current.focus();
      return
    }
    if(automataType==="DPDA"||automataType==="NPDA"){
      if(inputSym===''||stackTop===''||pushInput==='') return
      onSubmit(`${inputSym},${stackTop}/${pushInput}`);
    }else if(automataType==="MEALY"){
      if(inputMealy===''||outputMealy==='') return
      onSubmit(`${inputMealy}/${outputMealy}`)
    }else{
      onSubmit(inputValue);
    }
    setInputValue('')
    setPushInput('')
    setInputSym('')
    setStackTop('')
    setInputMealy('')
    setOutputMealy('')
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: theme.grey,
        paddingTop: '10px',
        borderRadius: '8px',
        borderWidth:1,
        borderColor:theme.grid,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        width: '350px',
        textAlign: 'center',
      }}>
        <h3 style={{
          marginBottom: '15px',
          fontSize: '1.2em',
          alignSelf: 'self-start',
          color: theme.black,
        }}>
          Enter Transition Symbol for {automataType}
        </h3>
        
        {(automataType === "DPDA" || automataType === "NPDA") && (
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
          </>
        )}

        {(automataType==="DFA"||automataType==="NFA")&&
          <input
          ref={inputRef}
          type="text"
          value={inputValue}
          spellCheck="false"
          name='input'
          onChange={(e) => handleChange(e, setInputValue)}
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
        }

        {(automataType==="MEALY")&&
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
            marginBottom: '15px',
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
        </>

        }

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginBottom: '15px'
        }}>
          {(automataType === "NFA" || automataType === "DPDA" || automataType === "NPDA") && (
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
              onClick={automataType === "DPDA"||automataType === "NPDA" ? epsilonclick : epsilon}
            >
              ε epsilon
            </button>
          )}
          {(automataType === "DPDA" || automataType === "NPDA")&& (
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
          )}
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
    </div>
  );
};

export default InputPopup;