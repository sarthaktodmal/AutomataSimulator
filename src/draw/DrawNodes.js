import { Circle, Arrow, Text, Group, Image } from "react-konva";
import React from 'react'

const DrawNodes = React.memo(({ node, currNode, selectedNode, finalNodes, showQuestion, handleNodeClick, handleDragMove, nodeMouseDown, nodeMouseUp, questionImage, theme, stateOutput, showStateOutput }) => {
    const isCurrent = Array.isArray(currNode) && currNode.some((n) => n.id === node.id);
    const NodeText = (showStateOutput&&stateOutput[node.id])?`${node.id}/${stateOutput[node.id]}`:node.id;
    
    return (
        <Group
            x={node.x}
            y={node.y}
            draggable
            onTap={() => handleNodeClick(node)}
            onClick={() => handleNodeClick(node)}
            onMouseDown={nodeMouseDown}
            onMouseUp={nodeMouseUp}
            onTouchStart={nodeMouseDown}
            onTouchEnd={nodeMouseUp}
            onDragMove={(e) => handleDragMove(e, node.id)}
        >

            {showQuestion && isCurrent && <Image image={questionImage} width={30} height={25} x={23} y={-35} />}
            {/*if node is first*/}
            {node.id === 'q0' && (
                <Arrow
                    points={[-70, 0, -32, 0]}
                    stroke={currNode && currNode.id === node.id ? theme.red : theme.black}
                    fill={currNode && currNode.id === node.id ? theme.red : theme.black}
                    pointerLength={10}
                    pointerWidth={10}
                />
            )
            }
            <Circle
                x={0}
                y={0}
                radius={30}
                fill={selectedNode ? (selectedNode.id === node.id ? theme.selected : theme.background) : (isCurrent ? currNode.some((n) => n.id === node.id && finalNodes.has(node.id)) ? theme.green : theme.red : theme.background)}
                stroke={selectedNode ? (selectedNode.id === node.id ? theme.selected2 : theme.black) : theme.black}
                strokeWidth={selectedNode ? (selectedNode.id === node.id ? 2 : 1) : 1}
                //shadowBlur={10}
                //shadowColor={selectedNode ? (selectedNode.id === node.id ? "rgba(89, 89, 255,1.0)" : "white") : (isCurrent ? currNode.some((n) => n.id===node.id&&finalNodes.has(node.id)) ? "#32CD32" : "red" : "white")}
            />
            {/* Draw one black ring if the node is final */}
            {finalNodes.has(node.id) && (
                <Circle
                    x={0}
                    y={0}
                    radius={25}
                    stroke={theme.black}
                    strokeWidth={1}
                    fill="transparent"
                />
            )}
            <Text
                x={-NodeText.length * 5 + ((showStateOutput&&stateOutput[node.id])?12:10)}
                y={-7}
                text={NodeText}
                fill={isCurrent ? 'white' : theme.black}
                fontSize={16}
                align="center"
                verticalAlign="middle"
                offsetX={8}
            />
        </Group>
    );
})
export default DrawNodes;