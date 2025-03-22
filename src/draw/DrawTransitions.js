import { Arrow, Text, Shape, Group, Rect } from "react-konva";
import React, { useState } from 'react'
import crossIcon from '../assets/cross5.png'

const DrawTransitions = ({transition,highlightedTransition,epsilonTrans,transitionMap,setTransitionMap,getNodeById,theme}) => { 
    //Helper
    const calculateArrowPoints = (sourceX, sourceY, targetX, targetY, radius) => {
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
        const startX = sourceX + radius * Math.cos(angle);
        const startY = sourceY + radius * Math.sin(angle);
        const endX = targetX - (radius+2) * Math.cos(angle);
        const endY = targetY - (radius+2) * Math.sin(angle);

        return { startX, startY, endX, endY };
    };
    
    const drawSelfLoop = (x, y, label,isHighlighted) => {
    const radius = 20;
    const loopRadius = 20;
    const angleOffset = Math.PI;
    const startAngle = -Math.PI - angleOffset;
    const endAngle = -Math.PI / 19 + angleOffset;
    const loopX = x;
    const loopY = y - radius - loopRadius;
    const arrowAngle = Math.PI / 18;

    return (
        <Group>
        <Shape
            sceneFunc={(context, shape) => {
            context.beginPath();
            context.arc(loopX, loopY, loopRadius, startAngle, endAngle, false);
            context.stroke();
            context.closePath();
            context.strokeShape(shape);
            }}
            stroke={ishovering?theme.lightgrey :isEpsilon?theme.blue:isHighlighted ?theme.red : theme.black}
            strokeWidth={2}
        />
        <Arrow
            points={[
            loopX + loopRadius * Math.cos(arrowAngle),
            loopY + loopRadius * Math.sin(arrowAngle),
            loopX + loopRadius * Math.cos(arrowAngle + Math.PI / 6),
            loopY + loopRadius * Math.sin(arrowAngle + Math.PI / 6),
            ]}
            stroke={ishovering?theme.lightgrey:isEpsilon?theme.blue:isHighlighted ?theme.red : theme.black}
            fill={ishovering?theme.lightgrey:isEpsilon?theme.blue:isHighlighted ?theme.red : theme.black}
            pointerLength={10}
            pointerWidth={10}
        />
        <Rect
            x={loopX - label.length * 3 - 6}
            y={loopY - loopRadius - 20}
            width={(loopX + label.length * 3) - (loopX - label.length * 3) + 10}
            height={18}
            fill={theme.background}
            opacity={0.8}
        />
        <Text
        onMouseEnter={handlemouseEnter}
        onMouseLeave={handlemouseLeave}
        onClick={lineCLick}
            x={loopX - label.length * 3 - 3}
            y={loopY - loopRadius - 18}
            text={label}
            fontSize={16}
            fill={theme.black}
            align="center"
            verticalAlign="middle"
        />
        </Group>
        );
    };
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
    
    const [ishovering,setIsHovering] = useState(false)
    //highlight when hovered
    const handlemouseEnter=(e)=>{
        const container = e.target.getStage().container()
        container.style.cursor = `url(${crossIcon}) 10 10, auto`;
        setIsHovering(true)
    }
    const handlemouseLeave=(e)=>{
        const container = e.target.getStage().container()
        container.style.cursor = "default"
        setIsHovering(false)
    }
    const lineCLick=()=>{
        setTransitionMap((prev) => {
            const updatedTransitionMap = Object.fromEntries(
                Object.entries(prev).map(([key, transitions_]) => [key,
                  transitions_.filter((transition_) =>
                      transition_!=transition
                  ),
                ])
            );
            return updatedTransitionMap
        });
    }

    //------------Main--------------

    const edge = { source: getNodeById(transition.sourceid), target: getNodeById(transition.targetid), label: transition.label };
    if(!edge.source || !edge.target) return;
    let isReverse = false;
    Object.entries(transitionMap).forEach(([k, Ts]) => {
        Ts.forEach((t) => {
          if (t.sourceid === edge.target.id && t.targetid === edge.source.id) {
            isReverse = true;
          }
        });
      });
    const isHighlighted = highlightedTransition?highlightedTransition.includes(transition):false;
    const isEpsilon = epsilonTrans?epsilonTrans.includes(transition)?!isHighlighted?true:false:false:false;

    let startX, startY, endX, endY,controlX,controlY;

    if (edge.source.id === edge.target.id) {
        return drawSelfLoop(edge.source.x, edge.source.y, edge.label,isHighlighted);
    } else {
        ({ startX, startY, endX, endY,controlX,controlY } = isReverse? calculateCurvedArrowPoints(
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
        ));
    }
    return (
          <Group>
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
                    stroke={ishovering?theme.lightgrey:isEpsilon?theme.blue:isHighlighted ?theme.red : theme.black}
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
                        context.fillStyle = ishovering?theme.lightgrey:isEpsilon?theme.blue:isHighlighted ?theme.red : theme.black;
                        context.fill();
                    }}
                    />
                </>
                );
            } else {
                return (
                <Arrow
                    points={[startX, startY, endX, endY]}
                    stroke={ishovering?theme.lightgrey:isEpsilon?theme.blue:isHighlighted ?theme.red : theme.black}
                    fill={ishovering?theme.lightgrey:isEpsilon?theme.blue:isHighlighted ? theme.red : theme.black}
                    pointerLength={10}
                    pointerWidth={10}
                />
                );
            }
            })()}
            {/* Label Text*/}
            <Group
            onMouseEnter={handlemouseEnter}
            onMouseLeave={handlemouseLeave}
            onClick={lineCLick}
            >
            <Rect
                x={isReverse ? calculateMidpointX(startX, controlX, endX) - (edge.label.length * 3.2) - 3: (startX + endX - (edge.label.length *6.5)) / 2 - 4}
                y={isReverse ? calculateMidpointY(startY, controlY, endY) - 5 : (startY + endY) / 2 - 10}
                width={edge.label.length * 7 + 10}
                height={20}
                fill={theme.background}
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
                fill={theme.black}
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

export default DrawTransitions