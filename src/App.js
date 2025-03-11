import React, { useState,useEffect } from "react";
import { Stage, Layer, Circle, Arrow, Text, Shape, Group, Line, Image,Rect } from "react-konva";
import InputPopup from './components/InputPopup';

const AutomataSimulator = () => {
  const [nodeMap, setNodeMap] = useState({});
  const [transitionMap, setTransitionMap] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [finiteNodes, setFiniteNodes] = useState(new Set());
  const [inputString, setInputString] = useState("");
  const [currNode, setCurrNode] = useState([]);
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

  //Expected Transition not provided (DFA)
  const [image, setImage] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);

  //StepWiseRunning Synchronization
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningStepWise, setIsRunningStepWise] = useState(false);

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

  //transition higlight
  useEffect(() => {
      let timerId = null;
      if (highlightedTransition) {
          if (timerId) clearTimeout(timerId);
          timerId = setTimeout(() => {
              setHighlightedTransition(null);
          }, 500);
      }
      return () => {
          if (timerId) clearTimeout(timerId);
      };
  }, [highlightedTransition]);

  const handleAddNode = () => {
    const x = (window.innerWidth / 2 - stageProps.x) / stageProps.scale;
    const y = (window.innerHeight / 2 - stageProps.y) / stageProps.scale;  
    const newNode = {
      id: `q${Object.keys(nodeMap).length}`,
      x: x,
      y: y,
    };
    setNodeMap((prev) => ({ ...prev, [newNode.id]: newNode }));
  };

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
    setIsRunningStepWise(false);
    setShowQuestion(false);
    setValidationResult(null)
    setCurrNode(null);
    setStepIndex(0);
    setHighlightedTransition(null);

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
    }
  };

  const calculateArrowPoints = (sourceX, sourceY, targetX, targetY, radius) => {
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
    const startX = sourceX + radius * Math.cos(angle);
    const startY = sourceY + radius * Math.sin(angle);
    const endX = targetX - (radius+2) * Math.cos(angle);
    const endY = targetY - (radius+2) * Math.sin(angle);

    return { startX, startY, endX, endY };
  };

  const drawSelfLoop = (x, y, label, index,isHighlighted) => {
    const radius = 20;
    const loopRadius = 20;
    const angleOffset = Math.PI;
    const startAngle = -Math.PI - angleOffset;
    const endAngle = -Math.PI / 19 + angleOffset;
    const loopX = x;
    const loopY = y - radius - loopRadius;
    const arrowAngle = Math.PI / 18;

    return (
      <Group key={`self-loop-${index}`}>
        <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.arc(loopX, loopY, loopRadius, startAngle, endAngle, false);
            context.stroke();
            context.closePath();
            context.strokeShape(shape);
          }}
          stroke={isHighlighted?"red":"black"}
          strokeWidth={2}
        />
        <Arrow
          points={[
            loopX + loopRadius * Math.cos(arrowAngle),
            loopY + loopRadius * Math.sin(arrowAngle),
            loopX + loopRadius * Math.cos(arrowAngle + Math.PI / 6),
            loopY + loopRadius * Math.sin(arrowAngle + Math.PI / 6),
          ]}
          stroke={isHighlighted?"red":"black"}
          fill={isHighlighted?"red":"black"}
          pointerLength={10}
          pointerWidth={10}
        />
        <Rect
          x={loopX - label.length * 3 - 6}
          y={loopY - loopRadius - 20}
          width={(loopX + label.length * 3) - (loopX - label.length * 3) + 10}
          height={18}
          fill={"white"}
          opacity={0.8}
        />
        
        <Text
          x={loopX - label.length * 3 - 3}
          y={loopY - loopRadius - 18}
          text={label}
          fontSize={16}
          fill="black"
          align="center"
          verticalAlign="middle"
        />
      </Group>
    );
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
    setIsRunning(true);
    if (isRunningStepWise) setIsRunningStepWise(false);
    setShowQuestion(false);
    setSelectedNode(null);
    setHighlightedTransition(null);
    setValidationResult(null);
    setStepIndex(0);
  
    let mcurrNode = nodeMap["q0"];
    setCurrNode([mcurrNode]);
  
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
      setHighlightedTransition(transition);
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
      setHighlightedTransition(transition);
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
    setShowQuestion(false);
    setSelectedNode(null)
    setValidationResult(null)
    setCurrNode(null);
    setHighlightedTransition(null);
    setStepIndex(0);
  };

  const NFARUN = () => {
    if (isRunning) return;
    setIsRunning(true);
    if (isRunningStepWise) setIsRunningStepWise(false);
    setShowQuestion(false);
    setSelectedNode(null);
    setHighlightedTransition([]);
    setValidationResult(null);

    setCurrNode([nodeMap["q0"]])
    handleRunNFA([nodeMap["q0"]], 0)
  }
  const handleRunNFA = async (currentNodes, charIndex) => {
    if (isRunning) return;
    setIsRunning(true);
    setStepIndex(charIndex);
  
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
      const availablePaths = transitions?transitions.filter(t => t.label.split(',').includes(char)):null; 
      const epsilonPaths = transitions?transitions.filter(t => t.label.split(',').includes('ε')):null;

      if (epsilonPaths&&epsilonPaths.length > 0) {
        for (const epsilon of epsilonPaths) {
          const nextNode = getNodeById(epsilon.targetid);
          if (nextNode) {
            currentNodes.push(nextNode);
            transitionsToHighlight.push(epsilon);
          }
        }
        setCurrNode(currentNodes);
      }
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
    setHighlightedTransition(transitionsToHighlight);
    await sleep(500);
    setCurrNode(nextNodes);
    await handleRunNFA(nextNodes, charIndex + 1);
  };
  
  const handleNFAStep = async () => {
    if (isRunning) return;

    const char = inputString[stepIndex];
    let currentNodes = currNode;
    let nextNodes = [];
    let transitionsToHighlight = [];

    for (const currNode of currentNodes) {
      if (!transitionMap[currNode.id]) continue;

      const transitions = transitionMap[currNode.id];
      const availablePaths = transitions?transitions.filter(t => t.label.split(',').includes(char)):null; 
      const epsilonPaths = transitions?transitions.filter(t => t.label.split(',').includes('ε')):null;

      if (epsilonPaths&&epsilonPaths.length > 0) {
        for (const epsilon of epsilonPaths) {
          const nextNode = getNodeById(epsilon.targetid);
          if (nextNode) {
            currentNodes.push(nextNode);
            transitionsToHighlight.push(epsilon);
          }
        }
        setCurrNode(currentNodes);
      }
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
      setValidationResult(`String is invalid: No transition for ${char} from any current state`);
      return;
    }else{
      //await sleep(300);
      setHighlightedTransition(transitionsToHighlight);
      setCurrNode([])
      await sleep(500);
      setCurrNode(nextNodes);
      setStepIndex(stepIndex + 1);
    }
    if (stepIndex===inputString.length-1) {
      const isValid = nextNodes.some(node => finiteNodes.has(node.id));
      setValidationResult(isValid ? "String is Valid" : "String is invalid");
      setIsRunningStepWise(false);
      return;
    }
  };
  const onNFAStepClick = () => {
    if(isRunning)return
    if (!isRunningStepWise) {
      // Initialize stepwise run
      resetStepWise();
      setCurrNode([nodeMap["q0"]]);
      setStepIndex(0);
      setIsRunningStepWise(true);
      setValidationResult(null);
    } else {
      handleNFAStep(); // Execute a single step
    }
  };

  const drawGrid = (size, color) => {
    const lines = [];
    const stageWidth = window.innerWidth / stageProps.scale;
    const stageHeight = window.innerHeight / stageProps.scale;
    const startX = -stageProps.x / stageProps.scale;
    const startY = -stageProps.y / stageProps.scale;
    const endX = startX + stageWidth;
    const endY = startY + stageHeight;
    for (let i = Math.floor(startX / size) * size; i < endX; i += size) {
      lines.push(
        <Line key={`v${i}`} points={[i, startY, i, endY]} stroke={color} strokeWidth={0.5} />
      );
    }
    for (let j = Math.floor(startY / size) * size; j < endY; j += size) {
      lines.push(
        <Line key={`h${j}`} points={[startX, j, endX, j]} stroke={color} strokeWidth={0.5} />
      );
    }
    return lines;
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

  const calculateCurvedArrowPoints = (
    sourceX,
    sourceY,
    targetX,
    targetY,
    radiusFactor,
    nodeRadius
  ) => {
    const distance = Math.sqrt(
      Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2)
    );
    const centerX = (sourceX + targetX) / 2;
    const centerY = (sourceY + targetY) / 2;
    let angle = Math.atan2(targetY - sourceY, targetX - sourceX);
    const curveOffset = distance / radiusFactor;
  
    const controlX =
      centerX + curveOffset * Math.cos(angle + Math.PI / 2) * -1;
    const controlY =
      centerY + curveOffset * Math.sin(angle + Math.PI / 2) * -1;
  
    const angleToTarget = Math.atan2(targetY - controlY, targetX - controlX);
    const endX = targetX - (nodeRadius) * Math.cos(angleToTarget);
    const endY = targetY - (nodeRadius) * Math.sin(angleToTarget);
    const angleToSource = Math.atan2(sourceY - controlY, sourceX - controlX);
    const startX = sourceX - (nodeRadius) * Math.cos(angleToSource);
    const startY = sourceY - (nodeRadius) * Math.sin(angleToSource);
    return {
      startX,
      startY,
      endX,
      endY,
      controlX,
      controlY,
    };
  };  
  //to reduce transition curve as distance increase
  const calculateCurveStrength = (x1, y1, x2, y2) => {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return Math.max(6, distance / 60);
  };

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
        onChange={(e) => setInputString(e.target.value) }
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
        onPointerDown={(event)=> {if(event.evt.button === 1){
          setIsStageDragging(true);
        }}}
        onPointerUp={(event)=> {if(event.evt.button === 1){
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
          {showGrid && drawGrid(20, "#9c9c9c")}

          {Object.entries(transitionMap).map(([key,transitions])=>{
            return transitions.map((transition)=>{
              const edge = { source: getNodeById(transition.sourceid), target: getNodeById(transition.targetid), label: transition.label };
              let isReverse = false;
              Object.entries(transitionMap).forEach(([k, Ts]) => {
                Ts.forEach((t) => {
                  if (t.sourceid === edge.target.id && t.targetid === edge.source.id) {
                    isReverse = true;
                  }
                });
              });

              const isHighlighted = highlightedTransition && highlightedTransition.includes(transition);

              if (edge.source.id === edge.target.id) {
                return drawSelfLoop(edge.source.x, edge.source.y, edge.label, key,isHighlighted);
              } else {
                const { startX, startY, endX, endY,controlX,controlY } = isReverse? calculateCurvedArrowPoints(
                  edge.source.x,
                  edge.source.y,
                  edge.target.x,
                  edge.target.y,
                  calculateCurveStrength(edge.source.x, edge.source.y, edge.target.x, edge.target.y),
                  30
                ):calculateArrowPoints(
                  edge.source.x,
                  edge.source.y,
                  edge.target.x,
                  edge.target.y,
                  30,
                );
                return (
                  <Group key={transition.targetid + key +transition.label}>
                    {(() => {
                      if (isReverse) {
                        return (
                          <>
                            <Shape
                              sceneFunc={(context, shape) => {
                                context.beginPath();
                                context.moveTo(startX, startY);
                                context.quadraticCurveTo(controlX, controlY, endX, endY);
                                context.stroke();
                                context.strokeShape(shape);
                              }}
                              stroke={isHighlighted ? "red" : "black"}
                              strokeWidth={2}
                            />
                            <Shape
                              sceneFunc={(context, shape) => {
                                context.beginPath();
                                const arrowSize = 15;
                                const angleToCenter = Math.atan2(edge.target.y - endY, edge.target.x - endX);
                                context.moveTo(endX, endY);
                                context.lineTo(
                                  endX - arrowSize * Math.cos(angleToCenter + Math.PI / 6),
                                  endY - arrowSize * Math.sin(angleToCenter + Math.PI / 6)
                                );
                                context.lineTo(
                                  endX - arrowSize * Math.cos(angleToCenter - Math.PI / 6),
                                  endY - arrowSize * Math.sin(angleToCenter - Math.PI / 6)
                                );
                                context.closePath();
                                context.fillStyle = isHighlighted ? "red" : "black";
                                context.fill();
                              }}
                            />
                          </>
                        );
                      } else {
                        return (
                          <Arrow
                            points={[startX, startY, endX, endY]}
                            stroke={isHighlighted ? "red" : "black"}
                            fill={isHighlighted ? "red" : "black"}
                            pointerLength={10}
                            pointerWidth={10}
                          />
                        );
                      }
                    })()}
                    {/* Label Text */}
                    <Group>
                      <Rect
                        x={isReverse ? calculateMidpointX(startX, controlX, endX) - (edge.label.length * 3.2) - 3: (startX + endX - (edge.label.length *6.5)) / 2 - 4}
                        y={isReverse ? calculateMidpointY(startY, controlY, endY) - 5 : (startY + endY) / 2 - 10}
                        width={edge.label.length * 7 + 10}
                        height={20}
                        fill="white"
                        opacity={0.8}
                        blurRadius={2}
                      />
                      <Text
                        x={isReverse ? 
                          calculateMidpointX(startX, controlX, endX) - (edge.label.length * 6) / 2 : 
                          (startX + endX - (edge.label.length * 6)) / 2
                        }
                        y={isReverse ? 
                          calculateMidpointY(startY, controlY, endY) : 
                          (startY + endY - 15) / 2
                        }
                        text={edge.label}
                        fontSize={16}
                        fill="black"
                        align="center"
                        verticalAlign="middle"
                      />
                    </Group>
                  </Group>
                );
                //to place lable at mid of curve line
                function calculateMidpointX(startX, controlX, endX) {
                  return ((startX + 2 * controlX + endX) / 4 - 3);
                }
                function calculateMidpointY(startY, controlY, endY) {
                  return (startY + 2 * controlY + endY) / 4 - 8;
                }
              }
            })
          })}
        
          {Object.entries(nodeMap).map(([id,node])=>{
            const isCurrent = Array.isArray(currNode) && currNode.some((n) => n.id === node.id);
            return (
              <Group key={node.id}
                x={node.x}
                y={node.y}
                draggable
                onTap={() => handleNodeClick(node)}
                onClick={() => handleNodeClick(node)}
                onMouseDown={nodeMouseDown}
                onMouseUp={nodeMouseUp}
                onDragMove={(e) => handleDragMove(e, node.id)}
              >
                
                {showQuestion && isCurrent &&<Image image={image} width={30} height={25} x={23} y={-35}/>}
                {/*if node is first*/}
                {node.id === 'q0' && (
                  <Arrow
                    points={[-70, 0, -32, 0]}
                    stroke={currNode && currNode.id === node.id?"red":"black"}
                    fill={currNode && currNode.id === node.id?"red":"black"}
                    pointerLength={10}
                    pointerWidth={10}
                  />
                )
                }
                <Circle
                  x={0}
                  y={0}
                  radius={30}
                  fill={selectedNode ? (selectedNode.id === node.id ? "rgba(207, 207, 255,1.0)" : "white") : (isCurrent ? currNode.some((n) => n.id===node.id&&finiteNodes.has(node.id)) ? "#32CD32" : "red" : "white")}
                  stroke={selectedNode ? (selectedNode.id === node.id ? "rgba(89, 89, 255,1.0)" : "black") : "black"}
                  strokeWidth={selectedNode ? (selectedNode.id === node.id ? 2 : 1) : 1}
                />
                {/* Draw one black ring if the node is finite */}
                {finiteNodes.has(node.id) && (
                  <Circle
                    x={0}
                    y={0}
                    radius={25}
                    stroke="black"
                    strokeWidth={1}
                    fill="transparent"
                  />
                )}
                <Text
                  x={0 - node.id.length*5 + 10}             
                  y={-7}
                  text={node.id}
                  fill={isCurrent ? "white" : "black"}
                  fontSize={16}
                  align="center"
                  verticalAlign="middle"
                  offsetX={8}
                />
              </Group>
            );
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