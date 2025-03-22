import React, { useState,useEffect,useRef } from "react";
import { Stage, Layer } from "react-konva";
import InputPopup from './components/InputPopup';
import ReactDOM from 'react-dom';
import DrawTransitions from "./draw/DrawTransitions";
import DrawNodes from "./draw/DrawNodes";
import DrawGrid from "./draw/DrawGrid";
import { DPDA, DPDAStep } from "./logic/DPDA"
import { NPDA, NPDAStep,computeEpsilonClosure } from "./logic/NPDA"
import { DFA, DFAStep }from './logic/DFA'
import { NFA, NFAStep }from './logic/NFA'
import { lightTheme, darkTheme } from "./theme";

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
  const [automataType,setAutomataType] = useState("DFA");

  //DPDA STACK
  const [stack, setStack] = useState(['z₀']);

  //NPDA STACK
  const [stackContents, setStackContents] = useState([{node:'q0',stack:['z₀']}]);
  const [currentStatesNPDA, setCurrentStatesNPDA] = useState([{}]) // for stepwise NPDA

  //Loading
  const fileInputRef = useRef(null);

  //theme
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" ? darkTheme : lightTheme;
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

  const highlightTransitions = (transitions,time=500) => {
    setHighlightedTransition(transitions);
    setTimeout(() => {
      setHighlightedTransition([]);
    }, time);
  };  

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

  const deleteNode = () => {
    if (selectedNode&&selectedNode.id!=="q0") {
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
    setNodeMap((prev) => ({ ...prev, [nodeid]: { id: nodeid, x:x, y:y } }));
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
        if (existingTransition) {
            if(automataType!=="DPDA"&&automataType!=="NPDA"){
              const existingSymbols = new Set(existingTransition.label.split(','));
              const newSymbols = symbol.split(',').map((s) => s.trim());
              newSymbols.forEach((s) => existingSymbols.add(s));
              existingTransition.label = Array.from(existingSymbols).join(',');
            }else{
              const existingSymbols = new Set(existingTransition.label.split(' | '));
              const newSymbols = symbol.split(' | ').map((s) => s.trim());
              newSymbols.forEach((s) => existingSymbols.add(s));
              existingTransition.label = Array.from(existingSymbols).join(' | ');    
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
    if(isRunning)return
    ReactDOM.unstable_batchedUpdates(()=>{
      setIsStepCompleted(true);
      setIsRunningStepWise(false);
      setShowQuestion(false);
      setAcceptanceResult(null)
      setCurrEpsilonTrans([])
      setCurrNode([]);
      setStepIndex(0);
      setHighlightedTransition([]);
      setStack(['z₀'])
      setStackContents([{node:'q0',stack:['z₀']}])
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
      setStageProps((prev)=>({
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
      setSelectedNode(null)
    }
  };
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const getNodeById = (id) => nodeMap[id];

  //RUN DFA
  const handleRun = async () => {
    if (!nodeMap["q0"]) return;
    if (isRunning) return;
    ReactDOM.unstable_batchedUpdates(()=>{
      setIsRunning(true);
      if (isRunningStepWise) setIsRunningStepWise(false);
      setShowQuestion(false);
      setSelectedNode(null);
      setHighlightedTransition([]);
      setAcceptanceResult(null);
      setStepIndex(0);
    })
    DFA(inputString,transitionMap,nodeMap,setShowQuestion,setIsRunning,setAcceptanceResult,
      sleep,highlightTransitions,setCurrNode,setStepIndex,finalNodes,getNodeById)
  };

  //Prepare Stepwise DFA
  const onStepWiseClick = async() => {
    if(isRunning) return;
    if(!nodeMap["q0"]) return;
    if(isRunningStepWise){
      handleStepWise();
    }else{
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
      inputString,stepIndex,setStepIndex,currNode,setCurrNode,transitionMap
      ,setShowQuestion,setIsRunningStepWise,setAcceptanceResult,highlightTransitions
      ,sleep,getNodeById,setIsStepCompleted,finalNodes)
  };
  const resetStepWise = () => {
    ReactDOM.unstable_batchedUpdates(()=>{
      setShowQuestion(false);
      setSelectedNode(null)
      setAcceptanceResult(null)
      setCurrNode([]);
      setIsStepCompleted(true);
      setHighlightedTransition([]);
      setCurrEpsilonTrans([])
      setStepIndex(0);
      setStackContents([{node:'q0',stack:['z₀']}])
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
    NFA([nodeMap["q0"]],setStepIndex,sleep,inputString,
      setIsRunning,finalNodes,setAcceptanceResult,transitionMap,getNodeById,setShowQuestion,
      setCurrNode,highlightTransitions,setCurrEpsilonTrans,epsilonClosure)
  }
  const onNFAStepClick = () => {
    if(isRunning)return
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
      NFAStep(currNode,setStepIndex,stepIndex,sleep,inputString,
        setIsRunningStepWise,finalNodes,setAcceptanceResult,transitionMap,getNodeById,setShowQuestion,
        setCurrNode,highlightTransitions,setCurrEpsilonTrans,setIsStepCompleted,epsilonClosure); // Execute a single step
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
      setStack,sleep,highlightTransitions,getNodeById,
      setStepIndex,finalNodes,setAcceptanceResult,setShowQuestion
    )
  };
  const handleStepDPDA = async () => {
    if(isRunning)return
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
        stack,setStack,sleep,highlightTransitions,getNodeById,stepIndex,
        setStepIndex,finalNodes,setAcceptanceResult,setShowQuestion,setIsRunningStepWise,
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
      setStepIndex, finalNodes, setAcceptanceResult,setCurrEpsilonTrans,setShowQuestion
    )
  };
  const handleStepNPDA = async () => {
    if(isRunning)return
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
      NPDAStep(currentStatesNPDA,setCurrentStatesNPDA,inputString,stepIndex,transitionMap,setCurrNode,
        setStackContents,setStepIndex,setAcceptanceResult,setCurrEpsilonTrans,
        highlightTransitions,setIsRunningStepWise,getNodeById,finalNodes,sleep,setShowQuestion,setIsStepCompleted
      )
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
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
    setStageProps((prev)=>({
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
    setStageProps((prev)=>({
      ...prev,
      draggable: false
    }));
  }
  const nodeMouseUp = () => {
    setStageProps((prev)=>({
      ...prev,
      draggable: true
    }));
  }

  //IMPORT EXPORT
  //Function to trigger the file input dialog
  const handleImportClick = () => {
    fileInputRef.current.click();
  };
  // Function to handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setNodeMap(importedData.nodeMap || {});
          setTransitionMap(importedData.transitionMap || {});
          setFinalNodes(new Set(importedData.finalNodes) || new Set());
          setNodeNum(importedData.nodeNum || 0);
          setAutomataType(importedData.automataType || "DFA");
          setInputString(importedData.inputString || "");
          setStageProps(importedData.stageProps || { x: 0,y: 0,scale: 1,draggable: true})
        } catch (error) {
          console.error("Error parsing imported data:", error);
          alert("Failed to import data. Invalid file format.");
        }
      };
      reader.readAsText(file);
    }
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
  function run(){
    switch (automataType){
      case "DFA": return handleRun
      case "NFA": return NFARUN
      case "DPDA": return handleRunDPDA
      case "NPDA": return handleRunNPDA
      default: console.error("Wrong Automata Type")
    }
  }
  function step(){
    switch (automataType){
      case "DFA": return onStepWiseClick
      case "NFA": return onNFAStepClick
      case "DPDA": return handleStepDPDA
      case "NPDA": return handleStepNPDA
      default: console.error("Wrong Automata Type")
    }
  }
  return (
    <div style={{ position: "relative" }}>
      <img
      onClick={() => setTheme(theme === lightTheme ? darkTheme : lightTheme)}
      width={20}
      alt={'theme'}
      color="red"
      style={{ cursor:'pointer',position: "absolute", top: 9, right: 130, zIndex: 10, padding: 10, border: 'solid', borderRadius: 5, borderWidth: 0}}
      src={theme===lightTheme?require('./assets/sun.png'):require('./assets/moon.png')}
      />
      <button
        onClick={handleAddNode}
        style={{ position: "absolute", top: 10, left: 10, zIndex: 10, padding: 10, border: 'solid', borderRadius: 5, borderWidth: 0, color: "white", backgroundColor: theme.blue }}
      >
        Add Node
      </button>
      <button
        onClick={handleImportClick}
        style={{ position: "absolute", top: 10, right: 70, zIndex: 10, padding: 10, border: 'solid', borderRadius: 5, borderWidth: 0, color: "white", backgroundColor: theme.blue }}
      >
        Load
      </button>
      <button
        onClick={handleExportClick}
        style={{ position: "absolute", top: 10, right: 10, zIndex: 10, padding: 10, border: 'solid', borderRadius: 5, borderWidth: 0, color: "white", backgroundColor: theme.blue }}
      >
        Save
      </button>
      <input
        inputMode="text"
        placeholder="Enter String"
        value={inputString}
        maxLength={26}
        readOnly={isRunning || isRunningStepWise}
        onChange={(e) => setInputString(e.target.value.trim()) }
        style={{ backgroundColor:theme.background,color:theme.black,position: "absolute", bottom: 10, left: 10, zIndex: 10, padding: 15,borderWidth: 1,borderStyle:'solid',borderRadius: 5 }}
      />

      <button
        onClick={run()}
        style={{ position: "absolute", bottom: 10, left: 310, zIndex: 10, padding: 13, border: 'solid', borderRadius: 5, borderWidth: 0, color: "white", backgroundColor: theme.green }}
      >
        Run
      </button>
      <button
        onClick={step()}
        style={{ position: "absolute", bottom: 10, left: 380, zIndex: 10, padding: 13, border: 'solid', borderRadius: 5, borderWidth: 0, color: "white", backgroundColor: theme.blue }}
      >
        Step
      </button>
      {/**handleSetFinal */}
      {selectedNode && (
        <button
          onClick={handleSetFinal}
          style={{ position: "absolute", top: 10, left: 105, zIndex: 10, padding: 10, border: 'solid', borderRadius: 5, borderWidth: 1, color: "white", backgroundColor: "black" }}
        >
          Set Final
        </button>
      )}
      {selectedNode&&selectedNode.id!=="q0"&&(
        <img
          onClick={deleteNode}
          width={29}
          alt="del"
          src={require("./assets/delete.png")}
          style={{cursor:"pointer",position: "absolute", top: 10, left: 200, zIndex: 10,padding:6, border: 'solid', borderRadius: 5, borderWidth: 0, color: "white", backgroundColor: "red" }}
        />
      )}

      {selectedNode &&
        <span style={{ position: "absolute", bottom: 5, right: 60, zIndex: 10, padding: 15, color: "grey" }}>Select a node to add transition</span>
      }
      {acceptanceResult && (
        <div style={{ position: "absolute", bottom: 70, left: 10, zIndex: 10, color: acceptanceResult.toLowerCase().includes("accepted") ? "#32CD32" : "red", backgroundColor:acceptanceResult.toLowerCase().includes("accepted")?theme.greenTrans:theme.redTrans,
          paddingLeft:10,paddingRight:10,paddingTop:5,paddingBottom:5, borderRadius:5,fontSize: 18, fontWeight: "bold" }}>
          {acceptanceResult}
        </div>
      )}

      <select style={{ position: "absolute", bottom: 10, left: 210, zIndex: 10, height:45,width:80,padding:10, color: theme.black,backgroundColor:theme.background,borderStyle:'solid',borderRadius:5 }}
        value={automataType}
        name="automataType"
        onChange={(e) => {setAutomataType(e.target.value)
          setIsRunning(false)
          setIsRunningStepWise(false);
          setCurrEpsilonTrans([])
          resetStepWise()
        }}
      >
        <option value="DFA">DFA</option>
        <option value="NFA">NFA</option>
        <option value="DPDA">DPDA</option>
        <option value="NPDA">NPDA</option>
      </select>

      {inputString.split('').map((char,index) => {
          return <span key={index} style={{position:"absolute",
            bottom:10, left:480+index*40,zIndex:100, 
            backgroundColor: (index===stepIndex)?theme.red:theme.background,
            color:(index===stepIndex)?'white':theme.black,
            borderColor: (index===stepIndex)?theme.red:theme.black,
            userSelect:"none",
            padding:10, borderStyle:"solid", borderRadius:5, borderWidth:1}}>{char}</span>
        })}

      {automataType==="DPDA"&&stack.map((element,index)=>{
        return (
          <span key={`${element}-${index}`} style={{position:"absolute",
          bottom:100+(index*24), right:(index===stack.length-1)?54:55,zIndex:100,
          width:100,
          textAlign:"center",
          backgroundColor:theme.background,
          color:theme.black,
          userSelect:"none",
          borderWidth:(index===stack.length-1)?3:1,
          padding:2, borderStyle:"solid", borderRadius:0,}}>{element}</span>
        )
      })}

    {automataType==="NPDA"&&stackContents.map((stack, stackIndex) => (
        <div key={`stack-${stackIndex}`} style={{ position: 'absolute',
          bottom: 30,right:(stackIndex*70),zIndex:100,
         }}>
          {stack.stack.map((element, index) => (
            <span
              key={`${element}-${index}`}
              style={{
                position: 'absolute',
                bottom: 100 + (index * 24),
                right: (index === stack.stack.length - 1) ? 53.5 : 55,
                zIndex: 100,
                width: 50,
                textAlign: 'center',
                backgroundColor: theme.background,
                color: theme.black,
                userSelect: 'none',
                borderWidth: (index === stack.stack.length - 1) ? 3 : 1,
                padding: 2,
                borderStyle: 'solid',
                borderRadius: 0,
              }}
            >
              {element}
            </span>
          ))}
          <span key={stackIndex}
            style={{position:"absolute",
            color: theme.black,
            userSelect:"none",
            bottom:75, right:74,zIndex:100}}>{stack.node}</span>
        </div>
      ))}

      {automataType==="DPDA"&&
        <span style={{position:"absolute",
          color: theme.black,
          userSelect:"none",
          bottom:75, right:85,zIndex:100}}>Stack</span>
      }
    
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ background:theme===lightTheme?'white':'#1f1f1f', cursor: stageProps.draggable && stageDragging? "grabbing": "default"}}
        x={stageProps.x}
        y={stageProps.y}
        draggable={stageProps.draggable && stageDragging}
        onClick={handleStageClick}
        {...(stageProps.draggable && stageDragging ? { onDragMove: handleDragMoveScreen } : {})}
        onWheel={handleWheel}
        
        //desktop
        onPointerDown={(event)=> {if(event.evt.button === 0||event.evt.button === 1){
          setIsStageDragging(true);
        }}}
        onPointerUp={(event)=> {if(event.evt.button === 0||event.evt.button === 1){
          setIsStageDragging(false);
        }}}
        //mobile
        onTouchStart={() => setIsStageDragging(true)}
        onTouchEnd={() => setIsStageDragging(false)}

        scaleX={stageProps.scale}  
        scaleY={stageProps.scale}  
      >
        <Layer>
          {/* Grid Background */}
          <DrawGrid
            size={20}
            color={theme.grid}
            stageProps={stageProps}
          />

          {/* Render Transitions */}
          {Object.entries(transitionMap).map(([key,transitions])=>{
            return transitions.map((transition)=>{
              return(
                <DrawTransitions
                  transition={transition}
                  epsilonTrans={currEpsilonTrans}
                  key={transition.targetid+key+transition.label}
                  highlightedTransition={highlightedTransition}
                  transitionMap={transitionMap}
                  setTransitionMap={setTransitionMap}
                  getNodeById={(id)=>getNodeById(id)}
                  theme={theme}
                />
              )
            })
          })}

          {/* Render Nodes */}
          {Object.entries(nodeMap).map(([id,node])=>{
            return(
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
            )
          })}
        </Layer>
      </Stage>
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
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
    </div>
  );
};

export default AutomataSimulator;