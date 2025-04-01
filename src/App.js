import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer } from "react-konva";
import InputPopup from './components/inputs/InputPopup';
import ReactDOM from 'react-dom';
import DrawTransitions from "./draw/DrawTransitions";
import DrawNodes from "./draw/DrawNodes";
import DrawGrid from "./draw/DrawGrid";
import { DPDA, DPDAStep } from "./logic/DPDA"
import { NPDA, NPDAStep, computeEpsilonClosure } from "./logic/NPDA"
import { DFA, DFAStep } from './logic/DFA'
import { NFA, NFAStep } from './logic/NFA'
import { Mealy, MealyStep } from './logic/Mealy'
import { TM, TMStep } from './logic/TM'
import { lightTheme, darkTheme } from "./theme";
import ExampleMenu from "./components/ExampleMenu";

const AutomataSimulator = () => {
  const [nodeMap, setNodeMap] = useState({});
  const [transitionMap, setTransitionMap] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [finalNodes, setFinalNodes] = useState(new Set());
  const [inputString, setInputString] = useState("");
  const [currNode, setCurrNode] = useState([]);
  const [nodeNum, setNodeNum] = useState(0);
  const [acceptanceResult, setAcceptanceResult] = useState(null);
  const [stageProps, setStageProps] = useState({
    x: 0,
    y: 0,
    scale: 1,
    draggable: true
  });
  const [stageDragging, setIsStageDragging] = useState(false);

  const [highlightedTransition, setHighlightedTransition] = useState([]);
  const [currEpsilonTrans, setCurrEpsilonTrans] = useState([]);

  //Transition related error
  const [image, setImage] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);

  //StepWiseRunning Synchronization
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningStepWise, setIsRunningStepWise] = useState(false);
  const [isStepCompleted, setIsStepCompleted] = useState(true);

  //Symbol Input Popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [targetNode, setTargetNode] = useState(null);

  //DFA OR NFA
  const [automataType, setAutomataType] = useState("DFA");

  //DPDA STACK
  const [stack, setStack] = useState(['z₀']);

  //NPDA STACK
  const [stackContents, setStackContents] = useState([{ node: 'q0', stack: ['z₀'] }]);
  const [currentStatesNPDA, setCurrentStatesNPDA] = useState([{}]) // for stepwise NPDA

  //TM
  const [tape, setTape] = useState('')

  //Loading
  const fileInputRef = useRef(null);

  //theme
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "light" ? lightTheme : darkTheme;
  });

  useEffect(() => {
    localStorage.setItem("theme", theme === darkTheme ? "dark" : "light");
  }, [theme]);

  useEffect(() => {
    const img = new window.Image();
    img.src = require("./assets/q3.png");
    img.onload = () => {
      setImage(img);
    };
  }, []);

  useEffect(() => {
    setTape("BB" + inputString + "B")
  }, [inputString]);

  const highlightTransitions = (transitions, time = 500) => {
    setHighlightedTransition(transitions);
    setTimeout(() => {
      setHighlightedTransition([]);
    }, time);
  };

  //Addnode to random pos inside bouding box
  const boundingBox = {
    width: 400,
    height: 400,
  };
  const getCenteredBoundingBoxPosition = () => {
    return {
      x: (window.innerWidth - boundingBox.width) / 2,
      y: (window.innerHeight - boundingBox.height) / 2
    };
  };
  const getRandomPosition = () => {
    const centeredPosition = getCenteredBoundingBoxPosition();
    const x = centeredPosition.x + Math.random() * boundingBox.width;
    const y = centeredPosition.y + Math.random() * boundingBox.height;
    return { x, y };
  };
  const handleAddNode = () => {
    const { x, y } = getRandomPosition();
    const newNode = {
      id: `q${nodeNum}`,
      x: (x - stageProps.x) / stageProps.scale,
      y: (y - stageProps.y) / stageProps.scale,
    };
    setNodeNum((prev) => prev + 1);
    setNodeMap((prev) => ({ ...prev, [newNode.id]: newNode }));
  };

  const clearAll = () =>{
    ReactDOM.unstable_batchedUpdates(() => {
      setNodeMap({})
      setTransitionMap({})
      setSelectedNode(null)
      setFinalNodes(new Set())
      setInputString("")
      setCurrNode([])
      setNodeNum(0);
      setAcceptanceResult(null)
      setCurrEpsilonTrans([])
      setShowQuestion(false)
      setStack(['z₀'])
      setStackContents([{ node: 'q0', stack: ['z₀'] }])
      setCurrentStatesNPDA([{}])
      setTape('')
    })
  } 

  const deleteNode = () => {
    if (selectedNode && selectedNode.id !== "q0") {
      ReactDOM.unstable_batchedUpdates(() => {
        setNodeMap((prev) => {
          const newNodeMap = { ...prev };
          delete newNodeMap[selectedNode.id];
          return newNodeMap;
        });
        setTransitionMap((prev) => {
          const updatedTransitionMap = Object.fromEntries(
            Object.entries(prev).map(([key, transitions]) => [key,
              transitions.filter((transition) =>
                transition.sourceid !== selectedNode.id && transition.targetid !== selectedNode.id
              ),
            ])
          );
          Object.keys(updatedTransitionMap).forEach((key) => {
            if (updatedTransitionMap[key].length === 0) {
              delete updatedTransitionMap[key];
            }
          });
          return { ...updatedTransitionMap };
        });
        setFinalNodes((prev) =>
          new Set([...prev].filter(nodeid => nodeid !== selectedNode.id))
        );
        setSelectedNode(null);
      })
    }
  }
  const handleDragMove = (e, nodeid) => {
    const { x, y } = e.target.position();
    setNodeMap((prev) => ({ ...prev, [nodeid]: { id: nodeid, x: x, y: y } }));
  };

  const handleSymbolInputSubmit = (symbol) => {
    if (!symbol) return;
    if (selectedNode && targetNode) {
      setTransitionMap((prev) => {
        const newMap = { ...prev };
        if (!newMap[selectedNode.id]) {
          newMap[selectedNode.id] = [];
        }
        const existingTransition = newMap[selectedNode.id].find(
          (t) => t.targetid === targetNode.id
        );
        //handle if the label already exists
        if (existingTransition) {
          if (automataType === "DPDA" || automataType === "NPDA") {
            const existingSymbols = new Set(existingTransition.label.split(' | '));
            const newSymbols = symbol.split(' | ').map((s) => s.trim());
            newSymbols.forEach((s) => existingSymbols.add(s));
            existingTransition.label = Array.from(existingSymbols).join(' | ');
          } else {
            const existingSymbols = new Set(existingTransition.label.split(','));
            const newSymbols = symbol.split(',').map((s) => s.trim());
            newSymbols.forEach((s) => existingSymbols.add(s));
            existingTransition.label = Array.from(existingSymbols).join(',');
          }
        } else {
          const newTransition = {
            label: symbol.split(',').map((s) => s.trim()).join(','),
            sourceid: selectedNode.id,
            targetid: targetNode.id,
          };
          newMap[selectedNode.id].push(newTransition);
        }
        return newMap;
      });
      setSelectedNode(null);
      setTargetNode(null);
    }
    setIsPopupOpen(false);
  };

  const handleInputClose = () => {
    setIsPopupOpen(false);
    setSelectedNode(null);
    setTargetNode(null)
  };

  const handleNodeClick = (node) => {
    if (isRunning) return
    ReactDOM.unstable_batchedUpdates(() => {
      setIsStepCompleted(true);
      setIsRunningStepWise(false);
      setShowQuestion(false);
      setAcceptanceResult(null)
      setCurrEpsilonTrans([])
      setCurrNode([]);
      setStepIndex(0);
      setHighlightedTransition([]);
      setStack(['z₀'])
      setStackContents([{ node: 'q0', stack: ['z₀'] }])
    })

    if (!selectedNode) {
      setSelectedNode(node);
    } else {
      setTargetNode(node);
      setIsPopupOpen(true);
    }
  };
  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedNode(null);
      setStageProps((prev) => ({
        ...prev,
        draggable: true
      }));
    }
  };

  const handleSetFinal = () => {
    if (selectedNode) {
      setFinalNodes((prev) => {
        const newFinalNodes = new Set(prev);
        if (newFinalNodes.has(selectedNode.id)) {
          newFinalNodes.delete(selectedNode.id);
        } else {
          newFinalNodes.add(selectedNode.id);
        }
        return newFinalNodes;
      });
    }
  };
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, 300));
  const getNodeById = (id) => nodeMap[id];

  //RUN DFA
  const handleRun = async () => {
    if (!nodeMap["q0"]) return;
    if (isRunning) return;
    ReactDOM.unstable_batchedUpdates(() => {
      setIsRunning(true);
      if (isRunningStepWise) setIsRunningStepWise(false);
      setShowQuestion(false);
      setSelectedNode(null);
      setHighlightedTransition([]);
      setAcceptanceResult(null);
      setStepIndex(0);
    })
    DFA(inputString, transitionMap, nodeMap, setShowQuestion, setIsRunning, setAcceptanceResult,
      sleep, highlightTransitions, setCurrNode, setStepIndex, finalNodes, getNodeById)
  };

  //Prepare Stepwise DFA
  const onStepWiseClick = async () => {
    if (isRunning) return;
    if (!nodeMap["q0"]) return;
    if (isRunningStepWise) {
      handleStepWise();
    } else {
      resetStepWise();
      setCurrNode([nodeMap["q0"]]);
      setIsRunningStepWise(true);
    }
  }
  const handleStepWise = async () => {
    if (selectedNode) setSelectedNode(null);
    if (!isStepCompleted) return;
    setIsStepCompleted(false);
    DFAStep(
      inputString, stepIndex, setStepIndex, currNode, setCurrNode, transitionMap
      , setShowQuestion, setIsRunningStepWise, setAcceptanceResult, highlightTransitions
      , sleep, getNodeById, setIsStepCompleted, finalNodes)
  };
  const resetStepWise = () => {
    ReactDOM.unstable_batchedUpdates(() => {
      setShowQuestion(false);
      setSelectedNode(null)
      setAcceptanceResult(null)
      setCurrNode([]);
      setIsStepCompleted(true);
      setHighlightedTransition([]);
      setCurrEpsilonTrans([])
      setStepIndex(0);
      setStackContents([{ node: 'q0', stack: ['z₀'] }])
      setStack(['z₀'])
    })
  };

  //NFA
  const epsilonClosure = (nodes) => {
    const closure = new Set(nodes);
    const stack = [...nodes];
    let epsPath = []
    while (stack.length > 0) {
      const node = stack.pop();
      const transitions = transitionMap[node.id] || [];
      const epsilonPaths = transitions.filter(t => t.label.split(',').includes('ε'));
      for (const epsilon of epsilonPaths) {
        const nextNode = getNodeById(epsilon.targetid);
        epsPath.push(epsilon)
        if (nextNode && !closure.has(nextNode)) {
          closure.add(nextNode);
          stack.push(nextNode);
        }
      }
    }
    setCurrEpsilonTrans(epsPath)
    return Array.from(closure);
  };
  const NFARUN = () => {
    if (isRunning) return;
    setIsRunning(true);
    if (isRunningStepWise) setIsRunningStepWise(false);
    setShowQuestion(false);
    setSelectedNode(null);
    setAcceptanceResult(null);
    setCurrNode(epsilonClosure([nodeMap["q0"]]))
    NFA([nodeMap["q0"]], setStepIndex, sleep, inputString,
      setIsRunning, finalNodes, setAcceptanceResult, transitionMap, getNodeById, setShowQuestion,
      setCurrNode, highlightTransitions, setCurrEpsilonTrans, epsilonClosure)
  }
  const onNFAStepClick = () => {
    if (isRunning) return
    if (!isRunningStepWise) {
      // Initialize stepwise run
      resetStepWise();
      ReactDOM.unstable_batchedUpdates(() => {
        setCurrNode(epsilonClosure([nodeMap["q0"]]))
        setIsRunningStepWise(true);
        setIsStepCompleted(true)
      })
    } else {
      if (isRunning) return;
      if (!isStepCompleted) return;
      NFAStep(currNode, setStepIndex, stepIndex, sleep, inputString,
        setIsRunningStepWise, finalNodes, setAcceptanceResult, transitionMap, getNodeById, setShowQuestion,
        setCurrNode, highlightTransitions, setCurrEpsilonTrans, setIsStepCompleted, epsilonClosure); // Execute a single step
    }
  };

  //DPDA
  const handleRunDPDA = async () => {
    if (!nodeMap["q0"]) return;
    if (isRunning) return;
    ReactDOM.unstable_batchedUpdates(() => {
      setIsRunning(true);
      if (isRunningStepWise) setIsRunningStepWise(false);
      setShowQuestion(false);
      setSelectedNode(null);
      setHighlightedTransition([]);
      setAcceptanceResult(null);
      setStepIndex(0);
    })
    DPDA(nodeMap["q0"], setIsRunning, setCurrNode, inputString, transitionMap,
      setStack, sleep, highlightTransitions, getNodeById,
      setStepIndex, finalNodes, setAcceptanceResult, setShowQuestion
    )
  };
  const handleStepDPDA = async () => {
    if (isRunning) return
    if (!isRunningStepWise) {
      // Initialize stepwise run
      resetStepWise();
      ReactDOM.unstable_batchedUpdates(() => {
        setCurrNode([nodeMap["q0"]])
        setStepIndex(0);
        setIsRunningStepWise(true);
        setIsStepCompleted(true)
        setAcceptanceResult(null);
      })
    } else {
      if (!isStepCompleted) return;
      DPDAStep(currNode, setCurrNode, inputString, transitionMap,
        stack, setStack, sleep, highlightTransitions, getNodeById, stepIndex,
        setStepIndex, finalNodes, setAcceptanceResult, setShowQuestion, setIsRunningStepWise,
        setIsStepCompleted
      )
    }
  };

  //NPDA
  const handleRunNPDA = async () => {
    if (!nodeMap["q0"]) return;
    if (isRunning) return;
    ReactDOM.unstable_batchedUpdates(() => {
      setIsRunning(true);
      if (isRunningStepWise) setIsRunningStepWise(false);
      setShowQuestion(false);
      setSelectedNode(null);
      setHighlightedTransition([]);
      setAcceptanceResult(null);
      setCurrEpsilonTrans([])
      setStepIndex(0);
    })
    NPDA(nodeMap["q0"], setIsRunning, setCurrNode, inputString,
      transitionMap, setStackContents, sleep, highlightTransitions, getNodeById,
      setStepIndex, finalNodes, setAcceptanceResult, setCurrEpsilonTrans, setShowQuestion
    )
  };
  const handleStepNPDA = async () => {
    if (isRunning) return
    if (!isRunningStepWise) {
      // Initialize stepwise run
      resetStepWise();
      ReactDOM.unstable_batchedUpdates(() => {
        setCurrNode([nodeMap["q0"]])
        setStepIndex(0);
        setIsRunningStepWise(true);
        setIsStepCompleted(true)
        setAcceptanceResult(null);
        setCurrentStatesNPDA([{ node: nodeMap["q0"], stack: ['z₀'] }])

        //epsclosure of initial
        let iniclosure = computeEpsilonClosure([{ node: nodeMap["q0"], stack: ['z₀'] }], transitionMap, setCurrEpsilonTrans, getNodeById)
        setCurrentStatesNPDA(iniclosure);
        setCurrNode(iniclosure.map(state => state.node));
        setStackContents(iniclosure.map(state => ({ node: state.node.id, stack: [...state.stack] })));
      })
    } else {
      if (!isStepCompleted) return;
      NPDAStep(currentStatesNPDA, setCurrentStatesNPDA, inputString, stepIndex, transitionMap, setCurrNode,
        setStackContents, setStepIndex, setAcceptanceResult, setCurrEpsilonTrans,
        highlightTransitions, setIsRunningStepWise, getNodeById, finalNodes, sleep, setShowQuestion, setIsStepCompleted
      )
    }
  };

  //Mealy
  const handleRunMEALY = async () => {
    if (!nodeMap["q0"]) return;
    if (isRunning) return;
    ReactDOM.unstable_batchedUpdates(() => {
      setIsRunning(true);
      if (isRunningStepWise) setIsRunningStepWise(false);
      setShowQuestion(false);
      setSelectedNode(null);
      setHighlightedTransition([]);
      setAcceptanceResult(null);
      setStepIndex(0);
    })
    Mealy(inputString, transitionMap, nodeMap, setShowQuestion, setIsRunning,
      setAcceptanceResult, sleep, highlightTransitions, setCurrNode,
      setStepIndex, getNodeById)
  }
  //Prepare Stepwise DFA
  const handleRunStepMEALY = async () => {
    if (isRunning) return;
    if (!nodeMap["q0"]) return;
    if (isRunningStepWise) {
      if (selectedNode) setSelectedNode(null);
      if (!isStepCompleted) return;
      MealyStep(
        currNode, setCurrNode, inputString, acceptanceResult,
        transitionMap, stepIndex, setStepIndex, getNodeById, highlightTransitions,
        setAcceptanceResult, setShowQuestion, setIsRunningStepWise,
        setIsStepCompleted, sleep)
    } else {
      resetStepWise();
      setCurrNode([nodeMap["q0"]]);
      setIsRunningStepWise(true);
    }
  }

  //TM
  //Mealy
  const handleRunTM = async () => {
    if (!nodeMap["q0"]) return;
    if (isRunning) return;
    ReactDOM.unstable_batchedUpdates(() => {
      setIsRunning(true);
      if (isRunningStepWise) setIsRunningStepWise(false);
      setShowQuestion(false);
      setSelectedNode(null);
      setHighlightedTransition([]);
      setAcceptanceResult(null);
      setStepIndex(2);
    })
    await TM(nodeMap, transitionMap, inputString,
      setIsRunning, setShowQuestion,
      setAcceptanceResult, sleep,
      setStepIndex, setTape, finalNodes, getNodeById, setCurrNode, highlightTransitions)
  }
  const handleStepTM = async () => {
    if (isRunning) return
    if (!isRunningStepWise) {
      // Initialize stepwise run
      resetStepWise();
      ReactDOM.unstable_batchedUpdates(() => {
        setCurrNode([nodeMap["q0"]])
        setStepIndex(2);
        setIsRunningStepWise(true);
        setIsStepCompleted(true)
        setAcceptanceResult(null);
        setTape("BB" + inputString + "B")
      })
    } else {
      if (!isStepCompleted) return;
      TMStep(transitionMap, setIsRunningStepWise,
        setAcceptanceResult, sleep, stepIndex, setStepIndex, tape, setTape, finalNodes, getNodeById, currNode,
        setCurrNode, highlightTransitions, setIsStepCompleted
      )
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault()
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stageProps.scale;
    const pointer = stage.getPointerPosition();
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const mousePointTo = {
      x: (pointer.x - stageProps.x) / oldScale,
      y: (pointer.y - stageProps.y) / oldScale,
    };
    newScale = Math.min(Math.max(newScale, 0.5), 4.0); //limits
    setStageProps((prev) => ({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
      scale: newScale,
      draggable: prev.draggable
    }));
  };
  const handleDragMoveScreen = (e) => {
    setStageProps((prev) => ({
      ...prev,
      x: e.target.x(),
      y: e.target.y(),
    }));
  };
  const nodeMouseDown = () => {
    setStageProps((prev) => ({
      ...prev,
      draggable: false
    }));
  }
  const nodeMouseUp = () => {
    setStageProps((prev) => ({
      ...prev,
      draggable: true
    }));
  }

  //IMPORT EXPORT
  //Function to trigger the file input dialog
  const handleImportClick = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          loadAutomataData(importedData);
        } catch (error) {
          console.error("Error parsing imported data:", error);
          alert("Failed to import data. Invalid file format.");
        }
      };
      reader.readAsText(file);
    }
  };
  const loadAutomataData = (data) => {
    setNodeMap(data.nodeMap || {});
    setTransitionMap(data.transitionMap || {});
    setFinalNodes(new Set(data.finalNodes) || new Set());
    setNodeNum(data.nodeNum || 0);
    setAutomataType(data.automataType || "DFA");
    setInputString(data.inputString || "");
    setStageProps(data.stageProps || { x: 0, y: 0, scale: 1, draggable: true });
  
    setIsRunning(false);
    setIsRunningStepWise(false);
    setCurrEpsilonTrans([]);
    resetStepWise();
  };
  const handleExportClick = () => {
    const data = {
      nodeMap,
      transitionMap,
      finalNodes: Array.from(finalNodes),
      nodeNum,
      automataType,
      inputString,
      stageProps
    };
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `automata_${automataType}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  //RUN STEP BUTTONS
  function run() {
    switch (automataType) {
      case "DFA": return handleRun
      case "NFA": return NFARUN
      case "DPDA": return handleRunDPDA
      case "NPDA": return handleRunNPDA
      case "MEALY": return handleRunMEALY
      case "TM": return handleRunTM
      default: console.error("Wrong Automata Type")
    }
  }
  function step() {
    switch (automataType) {
      case "DFA": return onStepWiseClick
      case "NFA": return onNFAStepClick
      case "DPDA": return handleStepDPDA
      case "NPDA": return handleStepNPDA
      case "MEALY": return handleRunStepMEALY
      case "TM": return handleStepTM
      default: console.error("Wrong Automata Type")
    }
  }
  return (
    <div style={{
      position: "relative",
      height: "100vh",
      overflow: "hidden",
      backgroundColor: theme === lightTheme ? "#f5f5f5" : "#1a1a1a"
    }}>
      {/* Top Navigation Bar */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "56px",
        backgroundColor: theme === lightTheme ? "white" : "#242424",
        borderBottom: `1px solid ${theme.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: "15px",
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        {/* Logo */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <ExampleMenu
          theme={theme}
          lightheme={lightTheme}
          onClick={(file)=>loadAutomataData(file)}
          />
          <h1 style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "600",
            userSelect: 'none',
            color: theme.black,
          }}>
            Automata Simulator
          </h1>
        </div>
        {/* File Operations */}
        <div
          style={{
            flex: 1
          }}
        />
        {nodeNum!==0&&<button
          onClick={clearAll}
          style={{
            padding: "8px 12px",
            border: `1px solid ${theme.border}`,
            borderRadius: "6px",
            backgroundColor: "transparent",
            color: theme.black,
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
            transition: "all 0.2s",
            marginLeft: 'auto',
            userSelect: 'none',
          }}
        >
          Clear All
        </button>}
        <button
          onClick={handleImportClick}
          style={{
            padding: "8px 12px",
            border: `1px solid ${theme.border}`,
            borderRadius: "6px",
            backgroundColor: "transparent",
            color: theme.black,
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
            transition: "all 0.2s",
            marginLeft: 'auto',
            userSelect: 'none',
          }}
        >
          Load
        </button>
        <button
          onClick={(e)=>handleExportClick(e)}
          style={{
            padding: "8px 12px",
            border: `1px solid ${theme.border}`,
            borderRadius: "6px",
            backgroundColor: "transparent",
            color: theme.black,
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
            transition: "all 0.2s",
            userSelect: 'none',
          }}
        >
          Save
        </button>
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === lightTheme ? darkTheme : lightTheme)}
          style={{
            padding: "8px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: theme === lightTheme ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: "auto",
            transition: "all 0.2s"
          }}
        >
          <img
            width={18}
            alt={'theme'}
            src={theme === lightTheme ? require('./assets/sun.png') : require('./assets/moon.png')}
          />
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{
        position: "fixed",
        top: "56px",
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        overflow: "hidden"
      }}>
        {/* Main Canvas Area */}
        <div style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          backgroundColor: theme === lightTheme ? "white" : "#242424"
        }}>

          {/* Stack Display for DPDA */}
          {automataType === "DPDA" && (
            <div style={{
              position: "absolute",
              bottom: "60px",
              right: "24px",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              flexFlow: 'column-reverse',
              gap: "6px",
              userSelect: "none",
            }}>
              <span style={{
                color: theme.black,
                fontSize: "14px",
                fontWeight: "500",
                letterSpacing: "0.5px",
                alignSelf: 'center',
              }}>
                Stack
              </span>
              {stack.map((element, index) => (
                <span
                  key={`${element}-${index}`}
                  style={{
                    width: "80px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.background,
                    color: theme.black,
                    border: `${index === stack.length - 1 ? "2px" : "1px"} solid ${theme.black}`,
                    borderRadius: "6px",
                    userSelect: "none",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                  }}
                >
                  {element}
                </span>
              ))}
            </div>
          )}

          {/* Stack Display for NPDA */}
          {automataType === "NPDA" && (
            <div style={{
              position: "absolute",
              bottom: "60px",
              right: "24px",
              zIndex: 10,
              display: "flex",
              gap: "20px",
              userSelect: "none",
              pointerEvents: "none",
              flexFlow: 'row-reverse'
            }}>
              {stackContents.map((stack, stackIndex) => (
                <div key={`stack-${stackIndex}`} style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexFlow: 'column-reverse',
                }}>
                  <span style={{
                    color: theme.black,
                    fontSize: "14px",
                    fontWeight: "500",
                    letterSpacing: "0.5px",
                    marginTop: "5px",
                  }}>
                    {stack.node}
                  </span>
                  {stack.stack.map((element, index) => (
                    <span
                      key={`${element}-${index}`}
                      style={{
                        width: "50px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: theme.background,
                        color: theme.black,
                        border: `${index === stack.stack.length - 1 ? "3px" : "1px"} solid ${theme.black}`,
                        borderTopWidth: index === stack.stack.length - 1 ? '3px' : '1px',
                        borderBottomWidth: index === stack.stack.length - 1 ? '2px' : index === 0 ? '1px' : '0px',
                        userSelect: "none",
                        fontSize: "14px",
                        fontWeight: "500",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                      }}
                    >
                      {element}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Stage Component */}
          <Stage
            width={window.innerWidth - 280}
            height={window.innerHeight - 56 - 50}
            style={{
              background: theme === lightTheme ? "white" : "#242424",
              cursor: stageProps.draggable && stageDragging ? "grabbing" : "default",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: "50px",
            }}
            x={stageProps.x}
            y={stageProps.y}
            draggable={stageProps.draggable && stageDragging}
            onClick={handleStageClick}
            {...(stageProps.draggable && stageDragging ? { onDragMove: handleDragMoveScreen } : {})}
            onWheel={handleWheel}
            onPointerDown={(event) => {
              if (event.evt.button === 0 || event.evt.button === 1) {
                setIsStageDragging(true);
              }
            }}
            onPointerUp={(event) => {
              if (event.evt.button === 0 || event.evt.button === 1) {
                setIsStageDragging(false);
              }
            }}
            onTouchStart={() => setIsStageDragging(true)}
            onTouchEnd={() => setIsStageDragging(false)}
            scaleX={stageProps.scale}
            scaleY={stageProps.scale}
          >
            <Layer>
              <DrawGrid
                size={20}
                color={theme.grid}
                stageProps={stageProps}
              />
              {Object.entries(transitionMap).map(([key, transitions]) => {
                return transitions.map((transition) => (
                  <DrawTransitions
                    transition={transition}
                    epsilonTrans={currEpsilonTrans}
                    key={transition.targetid + key + transition.label}
                    highlightedTransition={highlightedTransition}
                    transitionMap={transitionMap}
                    setTransitionMap={setTransitionMap}
                    getNodeById={(id) => getNodeById(id)}
                    theme={theme}
                  />
                ));
              })}
              {Object.entries(nodeMap).map(([id, node]) => (
                <DrawNodes
                  key={node.id}
                  node={node}
                  currNode={currNode}
                  selectedNode={selectedNode}
                  finalNodes={finalNodes}
                  showQuestion={showQuestion}
                  handleNodeClick={handleNodeClick}
                  handleDragMove={handleDragMove}
                  nodeMouseDown={nodeMouseDown}
                  nodeMouseUp={nodeMouseUp}
                  questionImage={image}
                  theme={theme}
                />
              ))}
            </Layer>
          </Stage>
        </div>

        {/* Right Panel - Controls */}
        <div style={{
          width: "280px",
          height: "100%",
          backgroundColor: theme === lightTheme ? "white" : "#242424",
          borderLeft: `1px solid ${theme.border}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          {/* Automata Type Selector */}
          <div style={{
            padding: "16px",
            borderBottom: `1px solid ${theme.border}`
          }}>
            <h2 style={{
              margin: "0 0 12px 0",
              fontSize: "14px",
              fontWeight: "600",
              color: theme.black,
              letterSpacing: "0.5px"
            }}>
              Automata Type
            </h2>
            <select
              value={automataType}
              onChange={(e) => {
                setAutomataType(e.target.value);
                setIsRunning(false);
                setIsRunningStepWise(false);
                setCurrEpsilonTrans([]);
                resetStepWise();
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${theme.border}`,
                borderRadius: "6px",
                backgroundColor: theme === lightTheme ? "white" : "#2a2a2a",
                color: theme.black,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <option value="DFA">DFA</option>
              <option value="NFA">NFA</option>
              <option value="DPDA">DPDA</option>
              <option value="NPDA">NPDA</option>
              <option value="TM">TM</option>
              <option value="MEALY">MEALY</option>
            </select>
          </div>

          {/* State Controls */}
          <div style={{
            padding: "16px",
            borderBottom: `1px solid ${theme.border}`
          }}>
            <h2 style={{
              margin: "0 0 12px 0",
              fontSize: "14px",
              fontWeight: "600",
              color: theme.black,
              letterSpacing: "0.5px"
            }}>
              State Controls
            </h2>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <button
                onClick={handleAddNode}
                style={{
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: theme.blue,
                  color: "white",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
              >
                Add New State
              </button>

              {selectedNode && (
                <div style={{
                  display: "flex",
                  gap: "8px"
                }}>
                  <button
                    onClick={handleSetFinal}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "none",
                      borderRadius: "6px",
                      backgroundColor: theme === lightTheme ? "#2c3e50" : "#34495e",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "500",
                      transition: "all 0.2s"
                    }}
                  >
                    Toggle Final State
                  </button>
                  {selectedNode.id !== "q0" && (
                    <button
                      onClick={deleteNode}
                      style={{
                        padding: "4px",
                        width: 40,
                        border: "none",
                        borderRadius: "6px",
                        backgroundColor: "#e74c3c",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s"
                      }}
                    >
                      <img
                        width={25}
                        alt="del"
                        src={require("./assets/delete.png")}
                      />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Input String */}
          <div style={{
            padding: "16px",
            borderBottom: `1px solid ${theme.border}`,
            overflow: "hidden"
          }}>
            <h2 style={{
              margin: "0 0 12px 0",
              fontSize: "14px",
              fontWeight: "600",
              color: theme.black,
              letterSpacing: "0.5px"
            }}>
              Input String
            </h2>
            <input
              inputMode="text"
              placeholder="Enter string to test"
              value={inputString}
              maxLength={26}
              readOnly={isRunning || isRunningStepWise}
              onChange={(e) => setInputString(e.target.value.trim())}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: `1px solid ${theme.border}`,
                borderRadius: "6px",
                backgroundColor: theme === lightTheme ? "white" : "#2a2a2a",
                color: theme.black,
                fontSize: "13px",
                transition: "all 0.2s",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            padding: "16px",
            borderBottom: `1px solid ${theme.border}`,
            display: "flex",
            gap: "8px"
          }}>
            <button
              onClick={run()}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: theme.green,
                color: "white",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                transition: "all 0.2s"
              }}
            >
              Run
            </button>
            <button
              onClick={step()}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: theme.blue,
                color: "white",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                transition: "all 0.2s"
              }}
            >
              Step
            </button>
          </div>
          {/* Acceptance Result */}
          {acceptanceResult && (
            <div style={{
              padding: "16px",
              borderBottom: `1px solid ${theme.border}`
            }}>
              <h2 style={{
                margin: "0 0 12px 0",
                fontSize: "14px",
                fontWeight: "600",
                color: theme.black,
                letterSpacing: "0.5px"
              }}>
                Result
              </h2>
              <div style={{
                color: acceptanceResult.toLowerCase().includes("✔") ? "#32CD32" : "#e74c3c",
                fontSize: "13px",
                fontWeight: "600",
                padding: "8px 12px",
                backgroundColor: acceptanceResult.toLowerCase().includes("✔") ? theme.greenTrans : theme.redTrans,
                borderRadius: "6px"
              }}>
                {acceptanceResult}
              </div>
            </div>
          )}
         
        </div>

        {/* Bottom Bar with Input String Display */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: "280px",
          height: "50px",
          backgroundColor: theme === lightTheme ? "white" : "#242424",
          borderTop: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
          zIndex: 10
        }}>
          {/* Input String Characters Display */}
          <div style={{
            display: "flex",
            gap: "0px"
          }}>
            {(automataType === "TM" ? tape : inputString).split('').map((char, index) => (
              <span
                key={index}
                style={{
                  width: automataType === "TM" ? "28px" : "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: (index === stepIndex) ? theme.red : theme.background,
                  color: (index === stepIndex) ? "white" : theme.black,
                  userSelect: "none",

                  borderTopWidth: '1px',
                  borderBottomWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: theme.black,
                  borderLeftWidth: '1px',
                  borderRightWidth: index === (automataType === "TM" ? tape : inputString).length - 1 ? '1px' : '0px',
                  borderTopRightRadius: index === (automataType === "TM" ? tape : inputString).length - 1 ? '6px' : '0px',
                  borderBottomRightRadius: index === (automataType === "TM" ? tape : inputString).length - 1 ? '6px' : '0px',
                  borderTopLeftRadius: index === 0 ? '6px' : '0px',
                  borderBottomLeftRadius: index === 0 ? '6px' : '0px',

                  fontSize: "16px",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <InputPopup
          isOpen={isPopupOpen}
          onClose={handleInputClose}
          onSubmit={handleSymbolInputSubmit}
          automataType={automataType}
          theme={theme}
        />
      </div>
      <input
        type="file"
        style={{ display: "none" }}
        accept=".json"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
    </div>
  );
};

export default AutomataSimulator;
