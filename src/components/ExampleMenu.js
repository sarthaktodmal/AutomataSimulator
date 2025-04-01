import React, { useState } from 'react';

import automata_TM from '../assets/examples/automata_TM.json'
import automata_DFA from '../assets/examples/automata_DFA.json'
import automata_NFA from '../assets/examples/automata_NFA.json'
import automata_MEALY from '../assets/examples/automata_MEALY.json'
import automata_NPDA from '../assets/examples/automata_NPDA.json'
import automata_DPDA from '../assets/examples/automata_DPDA.json'

const ExampleMenu = ({ theme, lightheme, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const TM = "Turing Machine"
  const MEALY = "Mealy Machine"
  const DFA = "Deterministic FA"
  const NFA = "Non-Deterministic FA"
  const NPDA = "Non-Deterministic PDA"
  const DPDA = "Deterministic PDA"

  const examples = [
    { id: 1, name: "DFA for string that contains even no. of 1's and 0's", type: DFA, path: automata_DFA },
    { id: 2, name: "NFA for string a^n where n is divisible by 3", type: NFA, path: automata_NFA },
    { id: 3, name: 'DPDA for String with same no. of a and same no of b', type: DPDA, path: automata_DPDA },
    { id: 4, name: "NPDA for string WW^R where W={a,b}", type: NPDA, path: automata_NPDA },
    { id: 5, name: 'Turing Machine To Check WellForness of Parenthessis', type: TM, path: automata_TM },
    { id: 6, name: 'Mealy Machine Example', type: MEALY, path: automata_MEALY },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = (e) => {
    if (isOpen && !e.target.closest('.menu-container') && !e.target.closest('.hamburger')) {
      setIsOpen(false);
    }
  };

  // Updated styles with black and white theme
  const styles = {
    container: {
      position: 'relative',
      top: 0,
      left: 0,
      zIndex: 1000,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
      transition: '0.3s ease-in-out',
      pointerEvents: isOpen ? 'auto' : 'none',
      zIndex: isOpen ? 990 : -1,
    },
    hamburger: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: '26px',
      height: '16px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '6px',
      background: theme.backgroundColor,
      transition: '0.3s',
      zIndex: 1001,
    },
    line: {
      width: '100%',
      height: '0.8px',
      backgroundColor: theme.black,
    },
    menuContainer: {
      position: 'fixed',
      top: 0,
      left: isOpen ? '0' : '-320px',
      width: '280px',
      height: '100vh',
      backgroundColor: theme.background,
      boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
      transition: 'left 0.3s ease-in-out',
      padding: '20px',
      color: '#ffffff',
      zIndex: 1000,
    },
    headerText: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginTop: '10px',
      color: theme.black,
      position: 'relative',
      letterSpacing: '0.7px'
    },
    exampleListContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      marginTop: '10px',
      paddingTop: '10px',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'scroll',
      //Hide ScrollBar
      '&::-webkit-scrollbar': {
          display: 'none',
      },
      '-ms-overflow-style': 'none',
      scrollbarWidth: 'none',
    },
    
    exampleItemContainer: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px',
      borderRadius: '6px',
      transition: 'all 0.3s ease',
      background: theme.exampleItemBack,
      cursor: 'pointer',
      border: `1px solid ${theme.exampleItemBorder}`,
      boxShadow: 'none',
    },
    exampleItemHover: {
      background: theme.exampleItemHoverBack,
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 8px ${theme.exampleItemShadow}`,
      border: `1px solid ${theme.exampleItemHoverBorder}`,
    },
    imageStyle: {
      width: '48px',
      height: '48px',
      marginRight: '14px',
      borderRadius: '4px',
      objectFit: 'cover',
      border: `1px solid ${theme.exampleItemImageBorder}`,
    },
    exampleTextContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    exampleNameStyle: {
      fontSize: '14px',
      fontWeight: 500,
      color: theme.black,
      marginBottom: '5px',
      transition: '0.3s',
      letterSpacing: '0.5px',
    },
    exampleTypeStyle: {
      fontSize: '12px',
      color: theme.exampleItemSecondary,
      transition: '0.3s',
    },
  };

  return (
    <>
      {/* Separate overlay div with click handling */}
      {isOpen && (
        <div onClick={closeMenu} style={styles.overlay}></div>
      )}

      {/* Menu button container - always visible and clickable */}
      <div style={styles.container}>
        <div className="hamburger" style={styles.hamburger} onClick={toggleMenu}>
          <div style={styles.line}></div>
          <div style={styles.line}></div>
          <div style={styles.line}></div>
        </div>
      </div>

      {/* Menu container */}
      <div className="menu-container" style={styles.menuContainer}>
        <div style={styles.headerText}>
          Examples
        </div>
        <div style={styles.exampleListContainer}>
          {examples.map(example => (
            <div key={example.id}
              style={{ ...styles.exampleItemContainer }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = styles.exampleItemHover.background;
                e.currentTarget.style.transform = styles.exampleItemHover.transform;
                e.currentTarget.style.boxShadow = styles.exampleItemHover.boxShadow;
                e.currentTarget.style.border = styles.exampleItemHover.border;
              }}
              onClick={() => {
                onClick(example.path)
                toggleMenu()
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = styles.exampleItemContainer.background;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = styles.exampleItemContainer.boxShadow;
                e.currentTarget.style.border = styles.exampleItemContainer.border;
              }}>
              <img src={theme !== lightheme ? require('../assets/example.png') : require('../assets/examplelight.png')} alt={example.name} style={styles.imageStyle} />
              <div style={styles.exampleTextContainer}>
                <div style={styles.exampleNameStyle}>{example.name}</div>
                <div style={styles.exampleTypeStyle}>{example.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ExampleMenu;