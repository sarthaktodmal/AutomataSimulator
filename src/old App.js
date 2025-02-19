import React, { useState, useEffect } from "react";
import { Stage, Layer, Circle, Arrow, Text, Shape, Group } from "react-konva";

const AutomataSimulator = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [finiteNodes, setFiniteNodes] = useState(new Set());
  const [inputString, setInputString] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [executionSteps, setExecutionSteps] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleAddNode = () => {
    const newNode = {
      id: `q${nodes.length}`,
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50,
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleDragMove = (e, node) => {
    const { x, y } = e.target.attrs;
    setNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, x, y } : n))
    );
    setEdges((prev) =>
      prev.map((edge) => {
        if (edge.source.id === node.id) {
          return { ...edge, source: { ...edge.source, x, y } };
        } else if (edge.target.id === node.id) {
          return { ...edge, target: { ...edge.target, x, y } };
        }
        return edge;
      })
    );
  };

  const handleNodeClick = (node) => {
    if (!selectedNode) {
      setSelectedNode(node);
    } else {
      const transitionSymbol = prompt("Enter transition symbol:");
      if (transitionSymbol) {
        setEdges((prev) => [
          ...prev,
          { source: selectedNode, target: node, label: transitionSymbol },
        ]);
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

  const setupDFA = () => {
    const states = {};
    const acceptStates = new Set();

    // Create states
    nodes.forEach(node => {
      states[node.id] = { transitions: {} };
      if (finiteNodes.has(node.id)) {
        acceptStates.add(node.id);
      }
    });

    // Create transitions
    edges.forEach(edge => {
      states[edge.source.id].transitions[edge.label] = edge.target.id;
    });

    return { states, acceptStates };
  };

  const validateString = (input) => {
    const { states, acceptStates } = setupDFA();
    const startState = nodes[0]?.id; // Assuming the first node is the start state
    let currentState = startState;
    const steps = [];

    for (const symbol of input) {
      steps.push(currentState); // Record the current state
      if (states[currentState].transitions[symbol]) {
        currentState = states[currentState].transitions[symbol];
      } else {
        steps.push(currentState); // Record the rejection state
        return { valid: false, steps }; // Transition not found
      }
    }

    steps.push(currentState); // Record the final state
    return { valid: acceptStates.has(currentState), steps }; // Check if the current state is an accept state
  };

  const handleRun = () => {
    setValidationResult(null);
    setCurrentStep(0);
    setExecutionSteps([]);
    setIsRunning(true);

    const result = validateString(inputString);
    setExecutionSteps(result.steps);
    setValidationResult(result.valid ? "String is accepted" : "String is rejected");

    if (!result.valid) {
      // Highlight the rejection state
      setCurrentStep(result.steps.length - 1);
      setIsRunning(false);
      setValidationResult("String is rejected");
      return;
    }

    // Start step-by-step execution
    const interval = setInterval(() => {
      if (currentStep < result.steps.length) {
        setCurrentStep((prev) => prev + 1);
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 1000); // Adjust the speed of execution here (1000 ms = 1 second)
  };

  useEffect(() => {
    if (currentStep >= executionSteps.length) return;

    const currentState = executionSteps[currentStep];
    const isFinalStep = currentStep === executionSteps.length - 1;

    // If the current step is the last step and it's not valid, highlight the node in red
    if (isFinalStep && !validationResult.includes("accepted")) {
      setCurrentStep(currentStep);
    }
  }, [currentStep, executionSteps, validationResult]);

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
        <div style={{ position: "absolute", bottom: 70, left: 10, zIndex: 10, color: validationResult.includes("accepted") ? "green" : "red", fontSize: 18, fontWeight: "bold" }}>
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
          {edges.map((edge, index) => {
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
          })}
          {nodes.map((node) => {
            const isCurrent = executionSteps[currentStep] === node.id;
            const isRejected = currentStep === executionSteps.length - 1 && !validationResult.includes("accepted") && executionSteps[currentStep] === node.id;

            return (
              <Group key={node.id}>
                {/* Draw one black ring if the node is finite */}
                {finiteNodes.has(node.id) && (
                  <Circle
                    x={node.x}
                    y={node.y}
                    radius={35} // This is the radius of the additional circle
                    stroke="black"
                    strokeWidth={1}
                    fill="transparent"
                  />
                )}
                <Circle
                  x={node.x}
                  y={node.y}
                  radius={30}
                  fill={
                    isCurrent ? "rgba(24, 119, 242, 1.0)" : isRejected ? "rgba(255, 0, 0, 0.5)" : selectedNode && selectedNode.id === node.id ? "rgba(24, 119, 242, 1.0)" : "rgba(255, 255, 255, 1.0)"
                  }
                  stroke={isCurrent ? "red" : "black"}
                  strokeWidth={isCurrent ? 3 : 1}
                  draggable
                  onDragMove={(e) => handleDragMove(e, node)}
                  onClick={() => handleNodeClick(node)}
                />
                <Text
                  x={node.x}
                  y={node.y - 5}
                  text={node.id}
                  fontSize={16}
                  fill={
                    selectedNode && selectedNode.id === node.id
                      ? "rgba(255,255,255, 1.0)"
                      : "rgba(0, 0, 0, 1.0)"
                  }
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