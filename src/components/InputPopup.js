import React, { useState, useRef } from 'react';
import DFAInput from './DFAInput'
import NFAInput from './NFAInput'
import PDAInput from './PDAInput'
import MealyInput from './Mealy'
import TMInput from './TMInput'

const InputPopup = ({ isOpen, onClose, onSubmit,automataType,theme }) => {
  
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
       
        {automataType==="DFA"&&
          <DFAInput
            onClose={onClose}
            onSubmit={onSubmit}
            theme={theme}
          />
        }
        {automataType==="NFA"&&
          <NFAInput
            onClose={onClose}
            onSubmit={onSubmit}
            theme={theme}
          />
        }
        {(automataType==="NPDA"||automataType==="DPDA")&&
          <PDAInput
            onClose={onClose}
            onSubmit={onSubmit}
            automataType={automataType}
            theme={theme}
          />
        }
        {(automataType==="MEALY")&&
          <MealyInput
            onClose={onClose}
            onSubmit={onSubmit}
            theme={theme}
          />
        }
         {(automataType==="TM")&&
          <TMInput
            onClose={onClose}
            onSubmit={onSubmit}
            theme={theme}
          />
        }
      </div>
    </div>
  );
};

export default InputPopup;