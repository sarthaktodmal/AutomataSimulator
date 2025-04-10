import React from 'react';

const CharacterDialog = ({ x, y, isRunningStepWise, stepIndex, currentInputSymbol, currentStates, theme, automataType,stack,tape }) => {
    const dialogWidth = 180;
    const dialogHeight = 70;
    const arrowSize = 10;

    if (!isRunningStepWise || !x || !y) {
        return null;
    }

    const fillColor = theme === 'light' ? 'white' : '#2a2a2a';
    const borderColor = theme === 'light' ? 'black' : 'white';

    return (
        <div
            style={{
                position: 'fixed',
                left: x - dialogWidth / 2,
                top: y - dialogHeight - arrowSize,
                width: dialogWidth,
                height: dialogHeight,
                backgroundColor: fillColor,
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                padding: '12px',
                zIndex: 1000,
                border: `1px solid ${borderColor}`,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.2s'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    bottom: -arrowSize,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: arrowSize * 2,
                    height: arrowSize,
                    overflow: 'hidden',
                }}
            >
                <svg
                    width={arrowSize * 2}
                    height={arrowSize + 1}
                    style={{
                        display: 'block',
                        marginTop: '-1px',
                    }}
                >
                    <polygon
                        points={`0,0 ${arrowSize * 2},0 ${arrowSize},${arrowSize}`}
                        fill={fillColor}
                        stroke={borderColor}
                        strokeWidth="1"
                    />
                </svg>
            </div>

            <div
                style={{
                    color: theme === 'light' ? '#333' : '#fff',
                    fontSize: '14px',
                    whiteSpace: 'pre-line'
                }}
            >
                <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '16px' }}>
                    Position: {automataType==="TM"?stepIndex-1:stepIndex + 1}
                </div>
                {automataType==="DPDA"?
                    <div style={{ marginBottom: '4px' }}>
                    Looking for Transition: {currentInputSymbol},{stack[stack.length-1]}
                    </div>
                :
                automataType==="TM"?
                    <div style={{ marginBottom: '4px' }}>
                    Looking for Transition: {tape[stepIndex]}
                    </div>
                :
                    <div style={{ marginBottom: '4px' }}>
                    Looking for Transition: {currentInputSymbol}
                    </div>
                }
                
                <div>
                    From States: {Array.isArray(currentStates) ? currentStates.map(state => state.id).join(', ') : currentStates}
                </div>
            </div>
        </div>
    );
};

export default CharacterDialog;
