import React, { useState,useEffect } from "react";
import { Stage, Layer, Circle, Arrow, Text, Shape, Group, Line, Image,Rect } from "react-konva";
import InputPopup from './components/InputPopup';

const AutomataSimulator = () => {
  const [nodes, setNodes] = useState([]);
  const [nodeMap, setNodeMap] = useState({}); //Node Map for effiecency
  const [selectedNode, setSelectedNode] = useState(null);
  const [finiteNodes, setFiniteNodes] = useState(new Set());
  const [inputString, setInputString] = useState("");
  const [currNode, setCurrNode] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [stageProps, setStageProps] = useState({
    x: 0,
    y: 0,
    scale: 1,
    draggable: true
  });
  const [stageDragging, setIsStageDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const [highlightedTransition, setHighlightedTransition] = useState({});

  //Expected Transition not provided (DFA)
  const [image, setImage] = useState(null);
  const [showQuestion, setshowQuestion] = useState(false);

  //StepWiseRunning Synchronization
  const [stepIndex, setStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningStepWise, setIsRunningStepWise] = useState(false);

  //Symbol Input Popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [targetNode, settargetNode] = useState(null);
  
  useEffect(() => {
    const img = new window.Image();
    img.src = require("./assets/q3.png");
    img.onload = () => {
      setImage(img);
    };
  }, []);

  //Update NodeMap whenever nodes changes
  useEffect(() => {
    const map = {};
    nodes.forEach(node => {
      map[node.id] = node;
    });
    setNodeMap(map);
  }, [nodes]);

  //transition higlight
  useEffect(() => {
      let timerId = null;
      if (highlightedTransition) {
          if (timerId) clearTimeout(timerId);
          timerId = setTimeout(() => {
              setHighlightedTransition(null);
          }, 400);
      }
      return () => {
          if (timerId) clearTimeout(timerId);
      };
  }, [highlightedTransition]);


  const handleAddNode = () => {
    const x = (window.innerWidth / 2 - stageProps.x) / stageProps.scale;
    const y = (window.innerHeight / 2 - stageProps.y) / stageProps.scale;  
    const newNode = {
      id: `q${nodes.length}`,
      x: x,
      y: y,
      transitions: []
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleDragMove = (e, nodeid) => {
    const { x, y } = e.target.position();
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeid ? { ...n, x, y } : n))
    );
  };

  const handleSymbolInputSubmit = (symbol) => {
    if (!symbol) {
      console.warn("No transition symbol provided.");
      return;
    }
    if (!targetNode) {
      console.warn("No source node was selected.");
      return;
    }

    if (selectedNode) {
      const index = selectedNode.transitions.findIndex(item => item.targetid === targetNode.id);
      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === selectedNode.id
            ? {
              ...n,
              transitions: index !== -1
                ? n.transitions.map((t, i) =>
                  i === index
                    ? { ...t, label: `${t.label},${symbol}` }
                    : t
                )
                : [
                  ...n.transitions,
                  { targetid: targetNode.id, label: symbol },
                ],
            }
            : n
        )
      );
      setSelectedNode(null);
      settargetNode(null);
    }
    setIsPopupOpen(false);
  }

  const handleInputClose = () => {
    setIsPopupOpen(false);
    setSelectedNode(null);
    settargetNode(null)
  };

  const handleNodeClick = (node) => {
    //reset related to running
    if(isRunning)return
    setIsRunning(false);
    setIsRunningStepWise(false);
    setshowQuestion(false);
    setValidationResult(null)
    setCurrNode(null);
    setStepIndex(0);
    setshowQuestion(false);
    setHighlightedTransition(null);

    if (!selectedNode) {
      setSelectedNode(node);
    } else {
      settargetNode(node);
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

  const drawSelfLoop = (x, y, label, index) => {
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
          stroke="black"
          strokeWidth={2}
        />
        <Arrow
          points={[
            loopX + loopRadius * Math.cos(arrowAngle),
            loopY + loopRadius * Math.sin(arrowAngle),
            loopX + loopRadius * Math.cos(arrowAngle + Math.PI / 6),
            loopY + loopRadius * Math.sin(arrowAngle + Math.PI / 6),
          ]}
          stroke="black"
          fill="black"
          pointerLength={10}
          pointerWidth={10}
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

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const getNodeById = (id) => nodeMap[id]; //Using NodeMap to get node by Id

  const handleRun = async () => {
    if(isRunning) return;
    setIsRunning(true)
    if(isRunningStepWise) setIsRunningStepWise(false);
    setshowQuestion(false);
    setSelectedNode(null)
    setHighlightedTransition(null);
    setValidationResult(null)
    setStepIndex(0);
    let mcurrNode = nodes[0];
    setCurrNode(mcurrNode);

    for (const char of inputString) {
      await sleep(1000);
      let found = false;
      for (const transition of mcurrNode.transitions) {
        if (transition.label.split(",").filter(num => num !== "").includes(char)) {
          setHighlightedTransition({d: transition, target: mcurrNode.id}); //
          mcurrNode = getNodeById(transition.targetid);
          await sleep(200);
          setCurrNode(mcurrNode);
          found = true;
          break;
        }
      }
      if (!found) {
        setshowQuestion(true);
        setValidationResult(`No transition for '${char}' at ${mcurrNode.id}`)
        setIsRunning(false);
        return;
      }
      setStepIndex(prevStepIndex => prevStepIndex + 1)
    }
    if (finiteNodes.has(mcurrNode.id)) {
      setValidationResult("String is Valid")
    } else {
      setValidationResult("String is invalid")
    }
    setIsRunning(false);
  };

  const handleStepWise = async () => {
    if(selectedNode) setSelectedNode(null);
    const char = inputString[stepIndex];
    let found = false;
    let mcurrNode = currNode;

    if(inputString){
      for (const transition of mcurrNode.transitions) {
        if (transition.label.split(",").filter(num => num !== "").includes(char)) {
          setHighlightedTransition({d: transition, target: mcurrNode.id});//
          mcurrNode = getNodeById(transition.targetid);
          await sleep(200);
          setCurrNode(mcurrNode);
          found = true;
          break;
        }
      }
    
      if (!found) {
        setIsRunningStepWise(false);
        setshowQuestion(true);
        setValidationResult(`No transition for '${char}' at ${mcurrNode.id}`)
        return;
      }
    }
   
    //step wise finished
    if (stepIndex === inputString.length-1 || !inputString) {
      setIsRunningStepWise(false);
      if(finiteNodes.has(mcurrNode.id))
        setValidationResult("String is Valid")
      else
      setValidationResult("String is invalid")
    }
    setStepIndex(prevStepIndex => prevStepIndex + 1);
  };

  const onStepWiseClick = () => {
    if(isRunning) return;
    if(isRunningStepWise){
      handleStepWise();
    }else{
      resetStepWise();
      setCurrNode(nodes[0]);
      setIsRunningStepWise(true);
    }
  }

  const resetStepWise = () => {
    setshowQuestion(false);
    setSelectedNode(null)
    setValidationResult(null)
    setCurrNode(null);
    setHighlightedTransition(null);
    setStepIndex(0);
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

  // Calculate new scale
  let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

  // Adjust position to zoom into the pointer position
  const mousePointTo = {
    x: (pointer.x - stageProps.x) / oldScale,
    y: (pointer.y - stageProps.y) / oldScale,
  };

  //limits
  newScale = Math.min(Math.max(newScale, 0.5), 4.0);

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
    nodeRadius = 20
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
  
    const endX = targetX - (nodeRadius+9) * Math.cos(angleToTarget);
    const endY = targetY - (nodeRadius+9) * Math.sin(angleToTarget);
  
    const angleToSource = Math.atan2(sourceY - controlY, sourceX - controlX);
    const startX = sourceX - (nodeRadius+9) * Math.cos(angleToSource);
    const startY = sourceY - (nodeRadius+9) * Math.sin(angleToSource);
  
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
        onClick={handleRun}
        style={{ position: "absolute", bottom: 10, left: 230, zIndex: 10, padding: 15, border: 'solid', borderRadius: 10, borderWidth: 1, color: "white", backgroundColor: "#32CD32" }}
      >
        Run
      </button>
      <button
        onClick={onStepWiseClick}
        style={{ position: "absolute", bottom: 10, left: 300, zIndex: 10, padding: 15, border: 'solid', borderRadius: 10, borderWidth: 1, color: "white", backgroundColor: "#1877F2" }}
      >
        Step
      </button>
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
        <div style={{ position: "absolute", bottom: 70, left: 10, zIndex: 10, color: validationResult.includes("String is Valid") ? "#32CD32" : "red", fontSize: 18, fontWeight: "bold" }}>
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

      {/*Current Char Highlight*/}
      {inputString.split('').map((char,index) => {
          //{console.log(char,":",index,":",stepIndex)}
          return <span key={index} style={{position:"absolute",
            bottom:100, left:10+index*40,zIndex:100, 
            backgroundColor: (index===stepIndex)?"red":"white",
            color:(index===stepIndex)?"white":"black",
            padding:10, borderStyle:"solid", borderRadius:5, borderWidth:1}}>{char}</span>
        })}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ background: "white", cursor: stageProps.draggable && stageDragging? "grabbing": "default"}}
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

          {nodes.map((node, index) => {
            return node.transitions.map((transition, tindex) => {
              const edge = { source: node, target: getNodeById(transition.targetid), label: transition.label };
              let isReverse = nodes.some((n) => n.id === transition.targetid && n.transitions.some((t) => t.targetid === node.id));
              if (edge.source.id === edge.target.id) {
                return drawSelfLoop(edge.source.x, edge.source.y, edge.label, index);
              } else {
                const { startX, startY, endX, endY,controlX,controlY } = isReverse? calculateCurvedArrowPoints(
                  edge.source.x,
                  edge.source.y,
                  edge.target.x,
                  edge.target.y,
                  calculateCurveStrength(edge.source.x, edge.source.y, edge.target.x, edge.target.y),
                  20
                ):calculateArrowPoints(
                  edge.source.x,
                  edge.source.y,
                  edge.target.x,
                  edge.target.y,
                  30,
                );
                
                const isHighlighted = highlightedTransition && highlightedTransition.d.targetid === transition.targetid && highlightedTransition.d.label === transition.label && highlightedTransition.target === edge.source.id;
                
                return (
                  <Group key={transition.targetid + tindex}>
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
                        zIndex={-100}
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
          {nodes.map((node) => {
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
                {showQuestion && currNode && (currNode.id === node.id)&&<Image image={image} width={30} height={25} x={23} y={-35}/>}
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
                  fill={selectedNode ? (selectedNode.id === node.id ? "rgba(207, 207, 255,1.0)" : "white") : (currNode && currNode.id === node.id ? (finiteNodes.has(currNode.id) ? "#32CD32" : "red") : "white")}
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
                  fill={currNode ? currNode.id === node.id ? "white" : "black" : "black"}
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