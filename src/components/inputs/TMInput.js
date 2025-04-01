import React, { useState } from 'react';

export const TMInput = ({onClose,onSubmit,theme}) => {
    const [inputTM, setInputTM] = useState('');
    const [outputTM, setOutputTM] = useState('');
    const [direction, setDirection] = useState('R');

    const handleClose = () => {
        setInputTM('')
        setOutputTM('')
        setDirection('R')
        onClose();
    };

    const handleSubmit = () => {
        if(inputTM===''||outputTM==='') return
        onSubmit(`${inputTM}/${outputTM}${direction}`)
        setInputTM('')
        setOutputTM('')
        setDirection('R')
        onClose();
    }

    const onClickRight = ()=>{
      setDirection('R')
    }
    const onClickLeft = ()=>{
      setDirection('L')
    }

    return(
        <>
        <input
            type="text"
            value={inputTM}
            spellCheck="false"
            name='inputTM'
            placeholder='input'
            maxLength={1}
            onChange={(e)=>setInputTM(e.target.value)}
            style={{
                backgroundColor:theme.background,
                color:theme.black,
                width: '15%',
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
            value={outputTM}
            spellCheck="false"
            name='outputTM'
            placeholder='output'
            maxLength={1}
            onChange={(e)=>setOutputTM(e.target.value)}
            style={{
                backgroundColor:theme.background,
                color:theme.black,
                width: '15%',
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1em',
            }}
        />
        <span 
        style={{
          padding:10,
          marginTop:10,
          marginLeft:10,
          marginBottom:10,
          color:direction==='R'?theme.selected2:theme.black,
          borderStyle:'solid',
          borderWidth:2,
          cursor:'pointer',
          userSelect:'none',
          backgroundColor:direction==='R'?theme.selected:theme.background,
          borderColor:direction==='R'?theme.selected2:theme.grid,
          borderRadius:4,
        }} 
        onClick={onClickRight}
        >Right</span>
        <span style={{
          padding:10,
          marginTop:10,
          marginLeft:10,
          marginBottom:10,
          color:direction==='L'?theme.selected2:theme.black,
          borderStyle:'solid',
          borderWidth:2,
          cursor:'pointer',
          userSelect:'none',
          backgroundColor:direction==='L'?theme.selected:theme.background,
          borderColor:direction==='L'?theme.selected2:theme.grid,
          borderRadius:4,
        }} 
        onClick={onClickLeft}
        >Left</span>

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

export default TMInput