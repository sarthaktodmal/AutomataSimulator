import React, { useState, useEffect } from "react";
import { Stage, Layer, Circle, Arrow, Text, Shape, Group } from "react-konva";

const AutomataSimulator = () => {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [finiteNodes, setFiniteNodes] = useState(new Set());
  const [inputString, setInputString] = useState("");
  const [currNode, setCurrNode] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  const handleAddNode = () => {
    const newNode = {
      id: `q${nodes.length}`,
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50,
      transitions: []
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleDragMove = (e, node) => {
    const { x, y } = e.target.attrs;
    setNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, x, y } : n))
    );
  };

  const handleNodeClick = (node) => {
    setCurrNode(null)
    if (!selectedNode) {
      setSelectedNode(node);
    } else {
      const transitionSymbol = prompt("Enter transition symbol:");
      if (transitionSymbol) {
        setNodes((prevNodes) =>
          prevNodes.map((n) =>
            n.id === selectedNode.id
              ? {
                ...n,
                transitions: [
                  ...n.transitions,
                  { targetid: node.id, label: transitionSymbol },
                ],
              }
              : n
          )
        );
      }
      setSelectedNode(null);
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
    const endX = targetX - radius * Math.cos(angle);
    const endY = targetY - radius * Math.sin(angle);

    return { startX, startY, endX, endY };
  };

  const drawSelfLoop = (x, y, label, index) => {
    const radius = 20;
    const loopRadius = 20;
    const angleOffset = Math.PI;
    const startAngle = -Math.PI - angleOffset;
    const endAngle = -Math.PI / 14 + angleOffset;

    const loopX = x;
    const loopY = y - radius - loopRadius;

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
            loopX + loopRadius * Math.cos(endAngle),
            loopY + loopRadius * Math.sin(endAngle),
            loopX + loopRadius * Math.cos(endAngle - Math.PI / 6),
            loopY + loopRadius * Math.sin(endAngle - Math.PI / 6),
          ]}
          stroke="black"
          fill="black"
          pointerLength={10}
          pointerWidth={10}
        />
        <Text
          x={loopX - 5}
          y={loopY - loopRadius - 15}
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
  const getNodeById = (id) => nodes.find(node => node.id === id);

  const handleRun = async () => {
    if (!inputString) alert("Enter String to validate")
    setSelectedNode(null)
    setValidationResult(null)
    let currNode = nodes[0];
    setCurrNode(currNode);

    for (const char of inputString) {
      await sleep(500);
      console.log("Current Character: ", char)
      let found = false;
      for (const transition of currNode.transitions) {
        if (transition.label === char) {
          console.log(`Transition: ${currNode.id} -> ${transition.targetid} on '${char}'`);
          currNode = getNodeById(transition.targetid);
          setCurrNode(currNode);
          found = true;
          break;
        }
      }
      if (!found) {
        alert(`Invalid transition from ${currNode.id} on '${char}'`);
        return;
      }
    }
    await sleep(500);
    if (finiteNodes.has(currNode.id)) {
      setValidationResult("String is Valid")
    } else {
      setValidationResult("String is invalid")
    }
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
        onChange={(e) => setInputString(e.target.value)}
        style={{ position: "absolute", bottom: 10, left: 10, zIndex: 10, padding: 15 }}
      />

      <button
        onClick={handleRun}
        style={{ position: "absolute", bottom: 10, left: 230, zIndex: 10, padding: 15, border: 'solid', borderRadius: 10, borderWidth: 1, color: "white", backgroundColor: "#32CD32" }}
      >
        Run
      </button>
      {selectedNode && (
        <button
          onClick={handleSetFinite}
          style={{ position: "absolute", top: 10, left: 120, zIndex: 10, padding: 15, border: 'solid', borderRadius: 10, borderWidth: 1, color: "white", backgroundColor: "green" }}
        >
          Set Finite
        </button>
      )}
      {validationResult && (
        <div style={{ position: "absolute", bottom: 70, left: 10, zIndex: 10, color: validationResult.includes("String is Valid") ? "green" : "red", fontSize: 18, fontWeight: "bold" }}>
          {validationResult}
        </div>
      )}
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ background: "#f0f0f0" }}
        onClick={handleStageClick}
      >
        <Layer>
          {nodes.map((node, index) => {
            return node.transitions.map((transition, tindex) => {
              const edge = { source: node, target: getNodeById(transition.targetid), label: transition.label };

              if (edge.source.id === edge.target.id) {
                return drawSelfLoop(edge.source.x, edge.source.y, edge.label, index);
              } else {
                const { startX, startY, endX, endY } = calculateArrowPoints(
                  edge.source.x,
                  edge.source.y,
                  edge.target.x,
                  edge.target.y,
                  30
                );

                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                const dx = endX - startX;
                const dy = endY - startY;
                const angle = Math.atan2(dy, dx) - Math.PI / 2;

                const offset = 20;
                const labelX = midX + offset * Math.cos(angle);
                const labelY = midY + offset * Math.sin(angle);

                return (
                  <Group key={index}>
                    <Arrow
                      points={[startX, startY, endX, endY]}
                      stroke="black"
                      fill="black"
                      pointerLength={10}
                      pointerWidth={10}
                    />
                    <Text
                      x={labelX - 8}
                      y={labelY - 8}
                      text={edge.label}
                      fontSize={16}
                      fill="black"
                      align="center"
                      verticalAlign="middle"
                      padding={5}
                      shadowBlur={5}
                      shadowColor="rgba(0,0,0,0.3)"
                    />
                  </Group>
                );
              }
            })
          })}
          {nodes.map((node) => {
            return (
              <Group key={node.id}
                x={node.x}
                y={node.y}
                draggable
                onClick={() => handleNodeClick(node)}
                onDragMove={(e) => handleDragMove(e, node)}
              >
                {/*if node is first*/}
                {node.id == 'q0' && (
                  <Arrow
                    points={[-70, 0, -30, 0]}
                    stroke="black"
                    fill="black"
                    pointerLength={10}
                    pointerWidth={10}
                  />
                )
                }
                <Circle
                  x={0}
                  y={0}
                  radius={30}
                  fill={selectedNode ? (selectedNode.id == node.id ? "rgba(207, 207, 255,1.0)" : "white") : (currNode && currNode.id == node.id ? (finiteNodes.has(currNode.id) ? "green" : "red") : "white")}
                  stroke={selectedNode ? (selectedNode.id == node.id ? "rgba(89, 89, 255,1.0)" : "black") : "black"}
                  strokeWidth={selectedNode ? (selectedNode.id == node.id ? 2 : 1) : 1}
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
                  x={0}
                  y={-7}
                  text={node.id}
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
    </div>
  );
};

export default AutomataSimulator;