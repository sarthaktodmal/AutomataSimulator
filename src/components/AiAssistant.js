import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';

const AiAssistant = ({ theme, lightTheme, getCurrentAutomata, setCurrentAutomata }) => {
  const [apiKey, setApiKey] = useState(() => {
    // Try to get the API key from localStorage on initial load
    const savedKey = localStorage.getItem('gemini_api_key');
    return savedKey || "";
  });

  const [messages, setMessages] = useState([
    { text: "Welcome! Enter your Gemini API key to start chatting.", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    return !savedKey;
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Save API key to localStorage whenever it changes
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }, [apiKey]);

  const handleApiKeyChange = (e) => {
    const newKey = e.target.value;
    setApiKey(newKey);
  };

  const clearApiKey = () => {
    setApiKey("");
    setShowApiKey(true);
  };

  const getLastFourConversations = () => {
    // Filter out the welcome message and get actual conversations
    const conversations = messages.filter(msg => msg.text !== "Welcome! Enter your Gemini API key to start chatting.");
    // Get the last 8 messages (4 pairs of user-bot interactions)
    const lastMessages = conversations.slice(-8);
    // Format the conversations
    return lastMessages.map(msg =>
      `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n');
  };

  const FormatOfTranstion = `FORMAT EXAMPLE FOR DEFINING TRANSITION SYMBOLS:
  1. DFA: 'symbol1,symbol2,...'
  2. NFA: Same as DFA, but can include 'ε' (epsilon) for empty transitions
  3. NPDA: 'inputSymbol,stackTop/...push3,z₀,push1 | inputSymbol,stackTop/..,push2,push1'
  4. DPDA: Same as NPDA, but only allows **one** valid transition per input and stackTop
  5. TM: 'inputSymbol/outputSymbol<nospace>direction(R|L),...'
  6. MEALY: 'inputSymbol/outputSymbol,...'
  `;

  let _stageProps = {}

  const sendToGemini = async (input) => {
    if (!apiKey) return "Please enter your Gemini API key.";

    const { nodeMap, positions, transitions, finalNodes, nodeNum,
      automataType, inputString, stageProps } = getCurrentAutomata();
    const conversationHistory = getLastFourConversations();

    _stageProps = stageProps

    const message = `
    # Your Role
    You are an intelligent assistant inside an Automata Simulator.
     Users interact through a visual interface. You see the internal schema below (user does NOT see this):
    
    # Current Automata Schema Made By User:
    Automata Type: ${automataType}
    States: ${nodeMap}
    positions: ${positions}
    Transitions: ${transitions.map(t => `[${t.map(e => `"${e}"`).join(',')}]`).join(',')}
    Final States: ${finalNodes}
    Number of States: ${nodeNum}
    Input String: '${inputString}'
    <end of schema>
    
    # Automata Schema Rules
    - Multiple Transition Symbols between same states are seperated using ' | ' for NPDA and DPDA and ',' for others
    - Automata Types: DFA,NFA,DPDA,NPDA,TM,MEALY
    - Starts from state 'q0'
    - in DPDA and NPDA empty stack symbol is z₀
    - in TM (Turing Machine) we use 'B' to represent Blank

    # How to define Transition in Automata Schema
    **${FormatOfTranstion}**

    # STRICTLY FOLLOW BELLOW PATTERN DO NOT VIOLATE
    [Your natural language response to user] //- 
    Automata Type: [DFA | NFA | DPDA | NPDA | TM | MEALY]
    States: [COMMA_SEPARATED]
    positions: [X1,Y1],[X2,Y2],...
    Transitions: ["STARTSTATE","TRANSITION_SYMBOL","ENDSTATE"],[...]
    Final States: [STATES]
    Number of States: [N]
    InputString: some inputstring to test

    # RULES, STRICTLY, COMPULSARILY, DO NOT VIOLATE ANY OF THE BELOW
    **USE ' //- ' TO SEPERATE USER MESSAGE AND AUTOMATA SCHEMA USE PLAIN TEXT NO STYLING
    **DOUBLE CHECK UR GIVEN SCHEMA (IF ASKED TO CREARE) AND THE USER REQUEST IT SHOULD BE 100% CORRECT**
    **STRICTLY NO USE OF MARKDOWN STYLING IN RESPONCE LIKE BULLET POINT AND TABS**

    # User’s request:
    "${input}"
    }
    `;

    //console.log(message)
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: message }] }],
          generationConfig: {
            temperature: 0.0,
            topK: 5,
            topP: 0.5,
            maxOutputTokens: 1024,
          },
        }
      );
      if (response.data.candidates?.[0]?.content?.parts?.[0]?.text.split('//-')[1]) {
        console.log(response.data.candidates?.[0]?.content?.parts?.[0]?.text.split('//-')[1])
        const parsed = parseAutomata(response.data.candidates?.[0]?.content?.parts?.[0]?.text.split('//-')[1])
        console.log(parsed)
        if (parsed != null) setCurrentAutomata(parsed)
      }
      return response.data.candidates?.[0]?.content?.parts?.[0]?.text.split('//-')[0].replace(/\t/g, ' ') || "No response from AI.";
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Invalid API key
        clearApiKey();
        return "Invalid API key. Please enter a valid API key.";
      }
      return "Error occurred while connecting to AI service.";
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    const botResponse = await sendToGemini(input);
    setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  function parseAutomata(inputText) {
    const automata = {
      automataType: "",
      nodeMap: {},
      transitionMap: {},
      finalNodes: [],
      nodeNum: 0,
      inputString: "",
      stageProps: _stageProps
    };

    const lines = inputText.split('\n').map(l => l.trim());

    // Extract Automata Type
    automata.automataType = lines.find(line => line.startsWith("Automata Type:"))?.split(":")[1].trim();

    automata.inputString = lines.find(line => line.startsWith("InputString:"))?.split(":")[1].trim();

    // Extract States
    const statesLine = lines.find(line => line.startsWith("States:"));
    if (statesLine === "States:") return null;
    const states = statesLine?.split(":")[1].split(',').map(s => s.trim());


    // Extract Positions
    const posLine = lines.find(line => line.startsWith("positions:"));
    const positions = [...posLine.matchAll(/\[(-?\d+\.?\d*),(-?\d+\.?\d*)\]/g)].map(
      match => [parseFloat(match[1]), parseFloat(match[2])]
    );

    // Fill nodeMap
    states?.forEach((state, i) => {
      automata.nodeMap[state] = {
        id: state,
        x: positions[i][0],
        y: positions[i][1]
      };
    });

    // Extract Transitions
    const transLine = lines.find(line => line.startsWith("Transitions:"));
    const transitionMatches = [...transLine.matchAll(/\["(.*?)","(.*?)","(.*?)"]/g)];

    transitionMatches.forEach(([_, from, symbol, to]) => {
      // Format push symbols for DPDA/NPDA
      let formattedSymbol = symbol;
      if (["DPDA", "NPDA"].includes(automata.automataType)) {
        const [inp, stack] = symbol.split(',');
        if (stack?.includes('/')) {
          const [stackTop, pushRaw] = stack.split('/');
          let pushSymbols = [...pushRaw.matchAll(/z₀|[^]/g)].map(match => match[0]);
          formattedSymbol = `${inp},${stackTop}/${pushSymbols.join(',')}`;
        }
      }

      if (!automata.transitionMap[from]) automata.transitionMap[from] = [];

      const existing = automata.transitionMap[from].find(t => t.targetid === to);
      if (existing) {
        // Combine labels with separator
        const separator = ["DPDA", "NPDA"].includes(automata.automataType) ? " | " : ",";
        existing.label += separator + formattedSymbol;
      } else {
        automata.transitionMap[from].push({
          sourceid: from,
          label: formattedSymbol,
          targetid: to
        });
      }
    });

    // Extract Final States
    const finalLine = lines.find(line => line.startsWith("Final States:"));
    automata.finalNodes = finalLine?.split(":")[1].split(',').map(s => s.trim());

    // Number of States
    const numLine = lines.find(line => line.startsWith("Number of States:"));
    automata.nodeNum = parseInt(numLine?.split(":")[1]);

    return JSON.stringify(automata);
  }


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: theme === lightTheme ? "white" : "#242424" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", padding: "16px", borderBottom: `1px solid ${theme.border}`, gap: "12px" }}>
        <h2 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: theme.black, letterSpacing: "0.5px" }}>AI Assistant Beta</h2>
        <button onClick={() => setShowApiKey(!showApiKey)} style={{ padding: "6px 10px", border: `1px solid ${theme.border}`, borderRadius: "4px", backgroundColor: theme === lightTheme ? "white" : "#2a2a2a", color: theme.black, cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.2s ease" }}>
          <span style={{ fontSize: "12px", transform: showApiKey ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease", display: "inline-block" }}>▼</span>
          Key
        </button>
        {!apiKey && <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: theme.blue, textDecoration: "none", display: "flex", alignItems: "center", padding: "6px 10px", borderRadius: "4px", transition: "background-color 0.2s ease" }}>Get API Key</a>}
      </div>

      {/* API Key Input Dropdown */}
      {showApiKey && (
        <div style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${theme.border}`,
          backgroundColor: theme === lightTheme ? "#f8f8f8" : "#2a2a2a",
          animation: "slideDown 0.2s ease",
          '@keyframes slideDown': {
            from: {
              opacity: 0,
              transform: 'translateY(-10px)'
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}>
          <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}>
            <input
              type="password"
              placeholder="Enter your Gemini API Key"
              value={apiKey}
              onChange={handleApiKeyChange}
              style={{
                width: "100%",
                padding: "8px 12px",
                paddingRight: apiKey ? "32px" : "12px",
                border: `1px solid ${theme.border}`,
                borderRadius: "6px",
                backgroundColor: theme === lightTheme ? "white" : "#333",
                color: theme.black,
                fontSize: "13px",
              }}
            />
            {apiKey && (
              <button
                onClick={clearApiKey}
                style={{
                  position: "absolute",
                  right: "8px",
                  background: "none",
                  border: "none",
                  color: theme.black,
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.6,
                  transition: "opacity 0.2s ease",
                  ':hover': {
                    opacity: 1
                  }
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages Container - Scrollable */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "16px",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        '&::WebkitScrollbar': {
          display: "none"
        }
      }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              maxWidth: "85%",
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "user" ? theme.blue : theme.background,
              color: msg.sender === "user" ? "white" : theme.black,
              padding: "8px 12px",
              borderRadius: "12px",
              fontSize: "13px",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap"
            }}
          >
            {msg.sender === "user" ? (
              msg.text
            ) : (
              <ReactMarkdown
                components={{
                  table: ({ node, ...props }) => (
                    <div style={{ overflowX: 'auto', margin: '10px 0' }}>
                      <table style={{
                        borderCollapse: 'collapse',
                        width: '100%',
                        border: `1px solid ${theme.border}`
                      }} {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th style={{
                      padding: '8px',
                      backgroundColor: theme === lightTheme ? '#f5f5f5' : '#333',
                      border: `1px solid ${theme.border}`,
                      textAlign: 'left'
                    }} {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td style={{
                      padding: '8px',
                      border: `1px solid ${theme.border}`
                    }} {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li style={{
                      marginLeft: '20px',
                      marginBottom: '4px'
                    }} {...props} />
                  ),
                  code: ({ node, ...props }) => (
                    <code style={{
                      backgroundColor: theme === lightTheme ? '#f5f5f5' : '#333',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }} {...props} />
                  )
                }}
              >
                {msg.text}
              </ReactMarkdown>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container - Fixed at bottom */}
      <div style={{
        borderTop: `1px solid ${theme.border}`,
        backgroundColor: theme === lightTheme ? "white" : "#242424",
        padding: "12px 16px",
      }}>
        <div style={{
          display: "flex",
          gap: "8px",
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={apiKey ? "Ask Something..." : "Please enter your API key first"}
            disabled={!apiKey}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: `1px solid ${theme.border}`,
              borderRadius: "6px",
              backgroundColor: theme === lightTheme ? "white" : "#2a2a2a",
              color: theme.black,
              fontSize: "13px",
              opacity: apiKey ? 1 : 0.7,
              cursor: apiKey ? "text" : "not-allowed"
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!apiKey}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: theme.blue,
              color: "white",
              cursor: apiKey ? "pointer" : "not-allowed",
              fontSize: "13px",
              fontWeight: "500",
              opacity: apiKey ? 1 : 0.7,
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <span style={{ fontSize: "16px" }}>➤</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;