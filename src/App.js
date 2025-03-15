import React, { useState,useEffect } from "react";
import { Stage, Layer, } from "react-konva";
import InputPopup from './components/InputPopup';
import ReactDOM from 'react-dom';
import DrawTransitions from "./draw/DrawTransitions";
import DrawNodes from "./draw/DrawNodes";
import DrawGrid from "./draw/DrawGrid";

const AutomataSimulator = () => {
  const [nodeMap, setNodeMap] = useState({});
  const [transitionMap, setTransitionMap] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [finiteNodes, setFiniteNodes] = useState(new Set());
  const [inputString, setInputString] = useState("");
  const [currNode, setCurrNode] = useState([]);
  const [nodeNum, setNodeNum] = useState(0);
  const [validationResult, setValidationResult] = useState(null);
  const [stageProps, setStageProps] = useState({
    x: 0,
    y: 0,
    scale: 1,
    draggable: true
  });
  const [stageDragging, setIsStageDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

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

  useEffect(() => {
    const img = new window.Image();
    img.src = require("./assets/q3.png");
    img.onload = () => {
      setImage(img);
    };
  }, []);

  const highlightTransitions = (transitions) => {
    setHighlightedTransition(transitions);
    setTimeout(() => {
      setHighlightedTransition([]);
    }, 500);
  };  

  const handleAddNode = () => {
    const x = (window.innerWidth / 2 - stageProps.x) / stageProps.scale;
    const y = (window.innerHeight / 2 - stageProps.y) / stageProps.scale;  
    const newNode = {
      id: `q${nodeNum}`,
      x: x,
      y: y,
    };
    setNodeNum((prev)=>prev+1);
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
        setFiniteNodes((prev) => 
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
          const existingSymbols = new Set(existingTransition.label.split(','));
          const newSymbols = symbol.split(',').map((s) => s.trim());
          newSymbols.forEach((s) => existingSymbols.add(s));
          existingTransition.label = Array.from(existingSymbols).join(',');
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
    ReactDOM.unstable_batchedUpdates(() => {
      setIsStepCompleted(true);
      setIsRunningStepWise(false);
      setShowQuestion(false);
      setValidationResult(null)
      setCurrEpsilonTrans([])
      setCurrNode([]);
      setStepIndex(0);
      setHighlightedTransition([]);
    });

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
    }
  };

  const handleSetFinite = () => {
    if (selectedNode) {
      setFiniteNodes((prev) => {
        const newFiniteNodes = new Set(prev);
        if (newFiniteNodes.has(selectedNode.id)) {
          newFiniteNodes.delete(selectedNode.id);
        } else {
          newFiniteNodes.add(selectedNode.id);
        }
        return newFiniteNodes;
      });
      setSelectedNode(null)
    }
  };

  const sleep = (ms) => new Promise((resolve) => {
    const start = performance.now();
    const frame = () => {
      if (performance.now() - start >= ms) {
        resolve();
      } else {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  });
  const getNodeById = (id) => nodeMap[id];

  const handleRun = async () => {
    if (!nodeMap["q0"]) return;
    if (isRunning) return;
    let mcurrNode = nodeMap["q0"];
    ReactDOM.unstable_batchedUpdates(()=>{
      setIsRunning(true);
      if (isRunningStepWise) setIsRunningStepWise(false);
      setShowQuestion(false);
      setSelectedNode(null);
      setHighlightedTransition(null);
      setValidationResult(null);
      setStepIndex(0);
      setCurrNode([mcurrNode]);
    })
  
  
    for (const char of inputString) {
      const transitions = transitionMap[mcurrNode.id];
      const transition = transitions?transitions.filter((t) => t.label.split(',').includes(char)):null;
      const epsilonPaths = transitions?transitions.filter(t => t.label.split(',').includes('ε')):null;
      
      if(epsilonPaths&&epsilonPaths.length>=1){
        setShowQuestion(true);
        setIsRunning(false)
        setValidationResult("Epsilon Transitions not allowed in DFA")
        return;
      }
      await sleep(500);
      if(transition&&transition.length>1){
        setShowQuestion(true);
        setIsRunning(false)
        setValidationResult("Multiple Transitions for Same Symbol")
        return;
      }
      if (!transition || transition.length<=0) {
        setShowQuestion(true);
        setIsRunning(false);
        setValidationResult(`No transition for '${char}'`);
        return;
      }
      const nextNode = getNodeById(transition[0].targetid);
      highlightTransitions(transition)
      setCurrNode([]);
      await sleep(500);
      setCurrNode([nextNode]);
      mcurrNode = nextNode;
      setStepIndex((prevStepIndex) => prevStepIndex + 1);
    }
    
    if (mcurrNode && finiteNodes.has(mcurrNode.id)) {
      setValidationResult("String is Valid");
    } else {
      setValidationResult("String is invalid");
    }
    setIsRunning(false);
  };
  
  const handleStepWise = async () => {
    if (selectedNode) setSelectedNode(null);
    if (!isStepCompleted) return;
    setIsStepCompleted(false);
    const char = inputString[stepIndex];
    let mcurrNode = currNode[0];

    if (inputString && mcurrNode) {
      const transitions = transitionMap[mcurrNode.id];
      const transition = transitions?transitions.filter((t) => t.label.split(',').includes(char)):null;
      const epsilonPaths = transitions?transitions.filter(t => t.label.split(',').includes('ε')):null;
      
      if(epsilonPaths&&epsilonPaths.length>=1){
        setShowQuestion(true);
        setIsRunningStepWise(false)
        setValidationResult("Epsilon Transitions not allowed in DFA")
        return;
      }
      if(transition&&transition.length>1){
        setShowQuestion(true);
        setIsRunningStepWise(false)
        setValidationResult("Multiple Transitions for Same Symbol")
        return;
      }
      if (!transition || transition.length<=0) {
        setIsRunningStepWise(false);
        setShowQuestion(true);
        setValidationResult(`No transition for '${char}'`);
        return;
      }
      setCurrNode([])
      highlightTransitions(transition)
      await sleep(500);
      const nextNode = getNodeById(transition[0].targetid);
      setCurrNode([nextNode]);
      mcurrNode = nextNode;
    }
    if (stepIndex >= inputString.length - 1) {
      setIsRunningStepWise(false);
      if (mcurrNode && finiteNodes.has(mcurrNode.id)) {
        setValidationResult("String is Valid");
      } else {
        setValidationResult("String is invalid");
      }
    }
    setStepIndex((prevStepIndex) => prevStepIndex + 1);
    setIsStepCompleted(true);
  };
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
  const resetStepWise = () => {
    ReactDOM.unstable_batchedUpdates(()=>{
      setShowQuestion(false);
      setSelectedNode(null)
      setValidationResult(null)
      setCurrNode([]);
      setIsStepCompleted(true);
      setHighlightedTransition([]);
      setStepIndex(0);
    })
  };

  const NFARUN = () => {
    if (isRunning) return;
    setIsRunning(true);
    if (isRunningStepWise) setIsRunningStepWise(false);
    ReactDOM.unstable_batchedUpdates(() => {
      setShowQuestion(false);
      setSelectedNode(null);
      setValidationResult(null);
      setCurrNode(epsilonClosure([nodeMap["q0"]]))
    })
    handleRunNFA([nodeMap["q0"]],0)
  }
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
  const handleRunNFA = async (currentNodes, charIndex) => {
    if (isRunning) return;
    setIsRunning(true);
    setStepIndex(charIndex);
    currentNodes = epsilonClosure(currentNodes)

    if (charIndex === inputString.length) {
      setIsRunning(false);
      if (currentNodes.some(node => finiteNodes.has(node.id))) {
        setValidationResult("String is Valid");
      } else {
        setValidationResult("String is invalid");
      }
      return;
    }
    const char = inputString[charIndex];
    let nextNodes = [];
    let transitionsToHighlight = [];
    let noTransitionFound = true;
  
    for (const currNode of currentNodes) {
      const transitions = transitionMap[currNode.id];
      const availablePaths = transitions?transitions.filter(t => t.label.split(',').includes(char)):[]; 
  
      if (availablePaths&&availablePaths.length > 0) {
        for (const path of availablePaths) {
          const nextNode = getNodeById(path.targetid);
          if (nextNode) {
            nextNodes.push(nextNode);
            transitionsToHighlight.push(path);
            noTransitionFound = false;
          }
        }
      }
    }
    if (nextNodes.length === 0 && noTransitionFound) {
      setIsRunning(false);
      setShowQuestion(true);
      setValidationResult(`String is invalid: No transition for '${char}' from any current state`);  
      return;
    }
    await sleep(500);
    setCurrNode([]);
    highlightTransitions(transitionsToHighlight);
    setCurrEpsilonTrans([])
    await sleep(500);
    setCurrNode(epsilonClosure(nextNodes));
    await handleRunNFA(nextNodes, charIndex + 1);
  };
  
  const handleNFAStep = async () => {
    if (isRunning) return;
    if (!isStepCompleted) return;
    setIsStepCompleted(false);
    const char = inputString[stepIndex];
    let currentNodes = epsilonClosure(currNode);
    let nextNodes = [];
    let transitionsToHighlight = [];

    if(!char){
      const isValid = currentNodes.some(node => finiteNodes.has(node.id));
      setValidationResult(isValid ? "String is Valid" : "String is invalid");
      setIsRunningStepWise(false);
      return;
    }
    for (const currNode of currentNodes) {
      if (!transitionMap[currNode.id]) continue;
      const transitions = transitionMap[currNode.id];
      const availablePaths = transitions?transitions.filter(t => t.label.split(',').includes(char)):null;
      if (availablePaths&&availablePaths.length > 0) {
        for (const path of availablePaths) {
          const nextNode = getNodeById(path.targetid);
          if (nextNode && !nextNodes.includes(nextNode)) {
            nextNodes.push(nextNode);
            transitionsToHighlight.push(path);
          }
        }
      }
    }
    if (nextNodes.length === 0 && transitionsToHighlight.length === 0) {
      setIsRunningStepWise(false);
      setShowQuestion(true);
      setValidationResult(`String is invalid: No transition for '${char}' from any current state`);
      return;
    }else{
      ReactDOM.unstable_batchedUpdates(() => {
      highlightTransitions(transitionsToHighlight)
      setCurrEpsilonTrans([])
      setCurrNode([])
      })
      await sleep(500);
      ReactDOM.unstable_batchedUpdates(() => {
        nextNodes = epsilonClosure(nextNodes)
        setCurrNode(nextNodes);
        setStepIndex(stepIndex + 1);
      })
    }
    if (stepIndex===inputString.length-1) {
      const isValid = nextNodes.some(node => finiteNodes.has(node.id));
      setValidationResult(isValid ? "String is Valid" : "String is invalid");
      setIsRunningStepWise(false);
      return;
    }
    setIsStepCompleted(true);
  };
  const onNFAStepClick = () => {
    if(isRunning)return
    if (!isRunningStepWise) {
      // Initialize stepwise run
      resetStepWise();
      ReactDOM.unstable_batchedUpdates(() => {
        setCurrNode(epsilonClosure([nodeMap["q0"]]))
        setStepIndex(0);
        setIsRunningStepWise(true);
        setIsStepCompleted(true)
        setValidationResult(null);
      })
    } else {
      handleNFAStep(); // Execute a single step
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

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={handleAddNode}
        style={{ position: "absolute", top: 10, left: 10, zIndex: 10, padding: 15, border: 'solid', borderRadius: 10, borderWidth: 1, color: "white", backgroundColor: "#1877F2" }}
      >
        Add Node
      </button>
      <input
        inputMode="text"
        placeholder="Enter String"
        value={inputString}
        maxLength={38}
        readOnly={isRunning || isRunningStepWise}
        onChange={(e) => setInputString(e.target.value.trim()) }
        style={{ position: "absolute", bottom: 10, left: 10, zIndex: 10, padding: 15 }}
      />

      <button
        onClick={automataType==="DFA"?handleRun:NFARUN}
        style={{ position: "absolute", bottom: 10, left: 300, zIndex: 10, padding: 15, border: 'solid', borderRadius: 10, borderWidth: 1, color: "white", backgroundColor: "#32CD32" }}
      >
        Run
      </button>
      <button
        onClick={automataType==="DFA"?onStepWiseClick:onNFAStepClick}
        style={{ position: "absolute", bottom: 10, left: 370, zIndex: 10, padding: 15, border: 'solid', borderRadius: 10, borderWidth: 1, color: "white", backgroundColor: "#1877F2" }}
      >
        Step
      </button>
      {/**handleSetFinite */}
      {selectedNode && (
        <button
          onClick={handleSetFinite}
          style={{ position: "absolute", top: 10, left: 120, zIndex: 10, padding: 15, border: 'solid', borderRadius: 10, borderWidth: 1, color: "white", backgroundColor: "black" }}
        >
          Set Finite
        </button>
      )}
      {selectedNode&&selectedNode.id!=="q0"&&(
        <img
          onClick={deleteNode}
          width={34}
          alt="del"
          src={require("./assets/delete.png")}
          style={{cursor:"pointer",position: "absolute", top: 10, left: 225, zIndex: 10,padding:8, border: 'solid', borderRadius: 10, borderWidth: 1, color: "white", backgroundColor: "red" }}
        />
      )}

      {selectedNode &&
        <span style={{ position: "absolute", bottom: 5, right: 60, zIndex: 10, padding: 15, color: "grey" }}>Select a node to add transition</span>
      }
      {validationResult && (
        <div style={{ position: "absolute", bottom: 70, left: 10, zIndex: 10, color: validationResult.includes("String is Valid") ? "#32CD32" : "red", backgroundColor:"white", fontSize: 18, fontWeight: "bold" }}>
          {validationResult}
        </div>
      )}

      {/* Checkbox to toggle grid visibility */}
      <label style={{ position: "absolute", top: 10, right: 10, zIndex: 10, color: "black" }}>
        Grid
        <input
          type="checkbox"
          checked={showGrid}
          onChange={() => setShowGrid(!showGrid)}
          style={{marginLeft: 5}}
        />
      </label>

      <select style={{ position: "absolute", bottom: 12, left: 210, zIndex: 10, height:45,width:70,padding:10, color: "black" }}
        value={automataType}
        onChange={(e) => {setAutomataType(e.target.value)
          setIsRunning(false)
          setIsRunningStepWise(false);
          resetStepWise()
        }}
      >
        <option value="DFA">DFA</option>
        <option value="NFA">NFA</option>
      </select>

      {inputString.split('').map((char,index) => {
          return <span key={index} style={{position:"absolute",
            bottom:100, left:10+index*40,zIndex:100, 
            backgroundColor: (index===stepIndex)?"red":"white",
            color:(index===stepIndex)?"white":"black",
            padding:10, borderStyle:"solid", borderRadius:5, borderWidth:1}}>{char}</span>
        })}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ background:"white", cursor: stageProps.draggable && stageDragging? "grabbing": "default"}}
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
          {showGrid && <DrawGrid
            size={20}
            color={"#9c9c9c"}
            stageProps={stageProps}
          />}

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
                  getNodeById={(id)=>getNodeById(id)}
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
                finiteNodes={finiteNodes}
                showQuestion={showQuestion}
                handleNodeClick={handleNodeClick}
                handleDragMove={handleDragMove}
                nodeMouseDown={nodeMouseDown}
                nodeMouseUp={nodeMouseUp}
                questionImage={image}
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
      />
      </div>
    </div>
  );
};

export default AutomataSimulator;