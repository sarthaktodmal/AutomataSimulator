import React from 'react';
import { lightTheme } from '../theme';
import ReactDOM from 'react-dom';

const ProblemSelector = ({ isOpen, onClose, onSelect, theme }) => {

    const problems = {
        DFA: [
            {
                id: "dfa1",
                title: "Even 0's and Odd 1's",
                statement: "Design a DFA that accepts all strings over {0,1} that contain an even number of 0's and an odd number of 1's.",
                validStrings: ["01", "0011", "1001", "1100"],
                invalidStrings: ["00", "11", "010", "101"],
                hints: [
                    "Start with a state that represents even 0's and even 1's",
                    "Consider transitions for both 0 and 1 inputs",
                    "Remember to handle all possible combinations"
                ]
            },
            {
                id: "dfa2",
                title: "Ends with 101",
                statement: "Design a DFA that accepts all strings over {0,1} that end with '101'.",
                validStrings: ["101", "0101", "1101", "00101"],
                invalidStrings: ["100", "011", "111", "000"],
                hints: [
                    "Track the last three characters seen",
                    "Consider all possible combinations of last three characters",
                    "Remember that the string must end with exactly '101'"
                ]
            }
        ],
        NFA: [
            {
                id: "nfa1",
                title: "Contains 00 or 11",
                statement: "Design an NFA that accepts all strings over {0,1} that contain either '00' or '11' as a substring.",
                validStrings: ["00", "11", "001", "110", "1001"],
                invalidStrings: ["01", "10", "0101", "1010"],
                hints: [
                    "Consider separate paths for '00' and '11'",
                    "Use non-determinism to guess which pattern will appear",
                    "Remember that the patterns can appear anywhere in the string"
                ]
            }
        ],
        DPDA: [
            {
                id: "dpda1",
                title: "Balanced Parentheses",
                statement: "Design a DPDA that accepts all strings of balanced parentheses.",
                validStrings: ["()", "(())", "()()", "(()())"],
                invalidStrings: ["(", ")", "(()", "())"],
                hints: [
                    "Use the stack to track the number of open parentheses",
                    "Push for '(' and pop for ')'",
                    "The stack should be empty at the end of a valid string"
                ]
            }
        ],/*
        NPDA: [
            {
                id: "npda1",
                title: "Palindrome",
                statement: "Design an NPDA that accepts all palindromes over {0,1}.",
                validStrings: ["0", "1", "00", "11", "010", "101"],
                invalidStrings: ["01", "10", "001", "110"],
                hints: [
                    "Use non-determinism to guess the middle of the string",
                    "Push the first half onto the stack",
                    "Compare the second half with the stack contents"
                ]
            }
        ],
        TM: [
            {
                id: "tm1",
                title: "Binary Addition",
                statement: "Design a TM that adds two binary numbers.",
                validStrings: ["101+110=1011", "11+1=100", "0+0=0"],
                invalidStrings: ["101+", "+110", "abc"],
                hints: [
                    "Use separate tracks for the two numbers",
                    "Implement binary addition rules",
                    "Handle carry propagation"
                ]
            }
        ],
        MEALY: [
            {
                id: "mealy1",
                title: "Binary Complement",
                statement: "Design a Mealy machine that outputs the 1's complement of the input binary string.",
                validStrings: ["0/1", "1/0", "00/11", "11/00"],
                invalidStrings: ["0/0", "1/1", "a/b"],
                hints: [
                    "Output should be the complement of the input bit",
                    "Consider the timing of output",
                    "Handle empty input case"
                ]
            }
        ],
        MOORE: [
            {
                id: "moore1",
                title: "Parity Checker",
                statement: "Design a Moore machine that outputs '1' if the number of 1's in the input is even, and '0' otherwise.",
                validStrings: ["0/1", "1/0", "00/1", "11/1"],
                invalidStrings: ["0/0", "1/1", "a/b"],
                hints: [
                    "Track the parity of 1's in the current state",
                    "Output depends only on the current state",
                    "Consider the initial state output"
                ]
            }
        ]*/
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div style={{
                backgroundColor: theme === lightTheme ? "white" : "#242424",
                borderRadius: "12px",
                padding: "24px",
                width: "600px",
                maxHeight: "80vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                zIndex: 10001,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    paddingBottom: "16px",
                    borderBottom: `1px solid ${theme.border}`
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: "20px",
                        fontWeight: "600",
                        color: theme.black
                    }}>
                        Choose a Problem
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "8px",
                            borderRadius: "4px",
                            color: theme.black,
                            transition: "all 0.2s",
                            ":hover": {
                                backgroundColor: theme === lightTheme ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"
                            }
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    paddingRight: "8px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    '&::WebkitScrollbar': {
                        display: "none"
                    }
                }}>
                    {Object.entries(problems).map(([type, typeProblems]) => (
                        <div key={type} style={{ marginBottom: "24px" }}>
                            <h3 style={{
                                margin: "0 0 12px 0",
                                fontSize: "16px",
                                fontWeight: "600",
                                color: theme === lightTheme ? "#666" : "#999",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>
                                {type === "DFA" ? "Deterministic Finite Automaton" :
                                    type === "NFA" ? "Non-Deterministic Finite Automaton" :
                                        type === "DPDA" ? "Deterministic Pushdown Automaton" :
                                            type === "NPDA" ? "Non-Deterministic Pushdown Automaton" :
                                                type === "TM" ? "Turing Machine" :
                                                    type === "MEALY" ? "Mealy Machine" :
                                                        type === "MOORE" ? "Moore Machine" : type}
                            </h3>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px"
                            }}>
                                {typeProblems.map(problem => (
                                    <button
                                        key={problem.id}
                                        onClick={() => onSelect(problem)}
                                        style={{
                                            padding: "12px 16px",
                                            border: `1px solid ${theme.border}`,
                                            borderRadius: "8px",
                                            backgroundColor: theme === lightTheme ? "white" : "#2a2a2a",
                                            color: theme.black,
                                            cursor: "pointer",
                                            textAlign: "left",
                                            transition: "all 0.2s",
                                            ":hover": {
                                                backgroundColor: theme === lightTheme ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)",
                                                transform: "translateY(-1px)"
                                            }
                                        }}
                                    >
                                        <div style={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                            marginBottom: "4px"
                                        }}>
                                            {problem.title}
                                        </div>
                                        <div style={{
                                            fontSize: "13px",
                                            color: theme === lightTheme ? "#666" : "#999"
                                        }}>
                                            {problem.statement}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProblemSelector; 