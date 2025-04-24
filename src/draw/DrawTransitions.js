import { Arrow, Text, Shape, Group, Rect } from "react-konva";
import React, { useState, useEffect } from 'react'
import crossIcon from '../assets/cross5.png'

const DrawTransitions = React.memo(({ transition, highlightedTransition, epsilonTrans, transitionMap, setTransitionMap, getNodeById, theme }) => {

    //Helper
    const calculateArrowPoints = (sourceX, sourceY, targetX, targetY, radius) => {
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
        const startX = sourceX + radius * Math.cos(angle);
        const startY = sourceY + radius * Math.sin(angle);
        const endX = targetX - radius * Math.cos(angle);
        const endY = targetY - radius * Math.sin(angle);
        const endXLine = targetX - (radius+10) * Math.cos(angle);
        const endYLine = targetY - (radius+10) * Math.sin(angle);

        return { startX, startY, endX, endY,endXLine,endYLine };
    };

    const [ishovering, setIsHovering] = useState(false)
    const [progress, setProgress] = useState(0)
    const [, setIsAnimating] = useState(false)

    //filling effect
    useEffect(() => {
        if (highlightedTransition && highlightedTransition.includes(transition)) {
            setIsAnimating(true)
            setProgress(0)
            const duration = 200
            const startTime = Date.now()

            const animate = () => {
                const currentTime = Date.now()
                const elapsed = currentTime - startTime
                const newProgress = Math.min(elapsed / duration, 1)
                setProgress(newProgress)

                if (newProgress < 5) {
                    requestAnimationFrame(animate)
                } else {
                    setIsAnimating(false)
                }
            }

            requestAnimationFrame(animate)
        }
    }, [highlightedTransition, transition])

    const drawSelfLoop = (x, y, label, isHighlighted) => {
        const radius = 20;
        const loopRadius = 20;
        const loopX = x;
        const loopY = y - radius - loopRadius;
        const arrowAngle = Math.PI / 18;
    
        // Function to measure text width
        const measureTextWidth = (text) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = '14px Arial'; // Match font size and family
            return context.measureText(text).width;
        };
        // Calculate text width
        const textWidth = measureTextWidth(label);
        return (
            <Group>
                <Shape
                    sceneFunc={(context, shape) => {
                        context.beginPath();
    
                        // Move to the start of the arc without drawing a line
                        const startAngle = Math.PI / 1.37;
                        const endAngle = startAngle + (2.15 * Math.PI * 2) / 3; // 2/3 of a circle
    
                        // Calculate current angle based on progress
                        const currentAngle = startAngle + (endAngle - startAngle) * progress;
    
                        if (isHighlighted) {
                            // Draw the black background arc
                            context.beginPath();
                            context.arc(loopX, loopY, radius, startAngle, endAngle);
                            context.strokeStyle = theme.black;
                            context.lineWidth = 2;
                            context.stroke();
    
                            // Draw the red progress arc
                            context.beginPath();
                            context.arc(loopX, loopY, radius, startAngle, currentAngle);
                            context.strokeStyle = theme.red;
                            context.lineWidth = 3;
                            context.stroke();
                        } else {
                            context.beginPath();
                            context.arc(loopX, loopY, radius, startAngle, endAngle);
                            context.strokeStyle = ishovering ? theme.lightgrey : isEpsilon ? theme.blue : theme.black;
                            context.lineWidth = 2;
                            context.stroke();
                        }
                    }}
                    onMouseEnter={handlemouseEnter}
                    onMouseLeave={handlemouseLeave}
                    strokeWidth={2}
                />
                <Arrow
                    points={[
                        loopX + loopRadius * Math.cos(arrowAngle),
                        loopY + loopRadius * Math.sin(arrowAngle),
                        loopX + loopRadius * Math.cos(arrowAngle + Math.PI / 6),
                        loopY + loopRadius * Math.sin(arrowAngle + Math.PI / 6),
                    ]}
                    stroke={ishovering ? theme.lightgrey : isEpsilon ? theme.blue : isHighlighted && progress >= 0.9 ? theme.red : theme.black}
                    fill={ishovering ? theme.lightgrey : isEpsilon ? theme.blue : isHighlighted && progress >= 0.9 ? theme.red : theme.black}
                    pointerLength={10}
                    pointerWidth={10}
                />
                {/* Centered Rectangle */}
                <Group onMouseEnter={handlemouseEnter}
                    onMouseLeave={handlemouseLeave}
                    onClick={lineClick}>
                  <Rect
                    x={loopX - (textWidth / 2) - 5}
                    y={loopY - loopRadius - 26}
                    width={textWidth + 10}
                    height={24}
                    fill={theme.background}
                    opacity={0.8}
                    cornerRadius={5}
                />
                {/* Centered Text */}
                <Text
                    x={loopX - (textWidth / 2)}
                    y={loopY - loopRadius - 20}
                    text={label}
                    fontSize={14}
                    fill={theme.black}
                    align="center"
                    verticalAlign="middle"
                />
                </Group>
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
        const endX = targetX - (nodeRadius - 1) * Math.cos(angleToTarget);
        const endY = targetY - (nodeRadius - 1) * Math.sin(angleToTarget);
        const endXLine = targetX - (nodeRadius + 10) * Math.cos(angleToTarget);
        const endYLine = targetY - (nodeRadius + 10) * Math.sin(angleToTarget);
        const angleToSource = Math.atan2(sourceY - controlY, sourceX - controlX);
        const startX = sourceX - (nodeRadius - 1) * Math.cos(angleToSource);
        const startY = sourceY - (nodeRadius - 1) * Math.sin(angleToSource);
        return {
            startX,
            startY,
            endX,
            endY,
            endXLine,
            endYLine,
            controlX,
            controlY,
        };
    };

    const calculateCurveStrength = (x1, y1, x2, y2) => {
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return Math.max(6, distance / 60);
    };

    //highlight when hovered
    const handlemouseEnter = (e) => {
        const container = e.target.getStage().container()
        container.style.cursor = `url(${crossIcon}) 10 10, auto`;
        setIsHovering(true)
    }
    const handlemouseLeave = (e) => {
        const container = e.target.getStage().container()
        container.style.cursor = "default"
        setIsHovering(false)
    }
    const lineClick = () => {
        setTransitionMap((prev) => {
          const updatedTransitionMap = Object.fromEntries(
            Object.entries(prev)
              .map(([key, transitions_]) => {
                const newTransitions = transitions_.filter(
                  (transition_) => transition_ !== transition
                );
                return [key, newTransitions];
              })
              .filter(([key, newTransitions]) => newTransitions.length > 0)
          );
          return updatedTransitionMap;
        });
      }
    
    //Calculate Position of Label Background
    const measureTextWidth = (text) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '14px Arial'; // Set to match your Text component's font
        return context.measureText(text).width;
    };

    //------------Main--------------

    const edge = { source: getNodeById(transition.sourceid), target: getNodeById(transition.targetid), label: transition.label };
    if (!edge.source || !edge.target) return;
    let isReverse = false;
    Object.entries(transitionMap).forEach(([k, Ts]) => {
        Ts.forEach((t) => {
            if (t.sourceid === edge.target.id && t.targetid === edge.source.id) {
                isReverse = true;
            }
        });
    });
    const isHighlighted = highlightedTransition ? highlightedTransition.includes(transition) : false;
    const isEpsilon = epsilonTrans ? epsilonTrans.includes(transition) ? !isHighlighted ? true : false : false : false;

    let startX, startY, endX, endY, controlX, controlY,endXLine,endYLine;

    if (edge.source.id === edge.target.id) {
        return drawSelfLoop(edge.source.x, edge.source.y, edge.label, isHighlighted);
    } else {
        ({ startX, startY, endX, endY, endXLine, endYLine,controlX, controlY } = isReverse ? calculateCurvedArrowPoints(
            edge.source.x,
            edge.source.y,
            edge.target.x,
            edge.target.y,
            calculateCurveStrength(edge.source.x, edge.source.y, edge.target.x, edge.target.y),
            30
        ) : calculateArrowPoints(
            edge.source.x,
            edge.source.y,
            edge.target.x,
            edge.target.y,
            30,
        ));
    }

    // Calculate text width and height
    const textWidth = measureTextWidth(edge.label);
    const textHeight = 16;
    // Calculate text position
    const textX = isReverse
        ? calculateMidpointX(startX, controlX, endX) - textWidth / 2
        : (startX + endX - textWidth) / 2;

    const textY = isReverse
        ? calculateMidpointY(startY, controlY, endY)
        : (startY + endY - textHeight) / 2;

    return (
        <Group>
            {(() => {
                if (isReverse) {
                    return (
                        <>
                            <Shape
                                sceneFunc={(context, shape) => {
                                    // Create gradient for curved line
                                    const gradient = context.createLinearGradient(startX, startY, endX, endY);
                                    if (isHighlighted) {
                                        const gradientLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                                        const gradientOffset = progress * gradientLength;
                                        gradient.addColorStop(0, theme.red);
                                        gradient.addColorStop(Math.max(0, (gradientOffset - 20) / gradientLength), theme.red);
                                        gradient.addColorStop(gradientOffset / gradientLength, theme.black);
                                        gradient.addColorStop(1, theme.black);
                                    } else {
                                        gradient.addColorStop(0, ishovering ? theme.lightgrey : isEpsilon ? theme.blue : theme.black);
                                        gradient.addColorStop(1, ishovering ? theme.lightgrey : isEpsilon ? theme.blue : theme.black);
                                    }

                                    // Draw the curved line
                                    context.beginPath();
                                    context.moveTo(startX, startY);
                                    context.quadraticCurveTo(controlX, controlY, endXLine, endYLine);
                                    context.strokeStyle = gradient;
                                    context.lineWidth = isHighlighted? 3:2;
                                    context.stroke();
                                    context.strokeShape(shape);
                                }}
                                strokeWidth={2}
                            />
                            <Shape
                                sceneFunc={(context, shape) => {
                                    context.beginPath();
                                    const arrowSize = isHighlighted?16:15;
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
                                    // Only change arrow head color when progress is at least 90%
                                    context.fillStyle = isHighlighted && progress >= 0.9 ? theme.red : ishovering ? theme.lightgrey : isEpsilon ? theme.blue : theme.black;
                                    context.fill();
                                }}
                            />
                        </>
                    );
                } else {
                    return (
                        <Shape
                            sceneFunc={(context, shape) => {
                                // Create gradient
                                const gradient = context.createLinearGradient(startX, startY, endX, endY);
                                if (isHighlighted) {
                                    const gradientLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                                    const gradientOffset = progress * gradientLength;
                                    gradient.addColorStop(0, theme.red);
                                    gradient.addColorStop(Math.max(0, (gradientOffset - 20) / gradientLength), theme.red);
                                    gradient.addColorStop(gradientOffset / gradientLength, theme.black);
                                    gradient.addColorStop(1, theme.black);
                                } else {
                                    gradient.addColorStop(0, ishovering ? theme.lightgrey : isEpsilon ? theme.blue : theme.black);
                                    gradient.addColorStop(1, ishovering ? theme.lightgrey : isEpsilon ? theme.blue : theme.black);
                                }

       
                                // Draw the line with consistent width
                                context.beginPath();
                                context.moveTo(startX, startY);
                                context.lineTo(endXLine, endYLine);
                                context.strokeStyle = gradient;
                                context.lineWidth = isHighlighted? 3:2;
                                context.stroke();
                                context.strokeShape(shape);

                                // Draw the arrow head
                                //angle to center
                                const angle = Math.atan2(endY - startY, endX - startX);
                                const arrowSize = isHighlighted?16:15;
                                context.beginPath();
                                context.moveTo(endX, endY);
                                context.lineTo(
                                    endX - arrowSize * Math.cos(angle + Math.PI / 6),
                                    endY - arrowSize * Math.sin(angle + Math.PI / 6)
                                );
                                context.lineTo(
                                    endX - arrowSize * Math.cos(angle - Math.PI / 6),
                                    endY - arrowSize * Math.sin(angle - Math.PI / 6)
                                );
                                context.closePath();
                                // Only change arrow head color when progress is at least 90%
                                context.fillStyle = isHighlighted && progress >= 0.9 ? theme.red : ishovering ? theme.lightgrey : isEpsilon ? theme.blue : theme.black;
                                context.fill();
                            }}
                            strokeWidth={2}
                        />
                    );
                }
            })()}
            {/* Label Text*/}
            <Group
                onMouseEnter={handlemouseEnter}
                onMouseLeave={handlemouseLeave}
                onClick={lineClick}
            >
                <Rect
                    x={isReverse?textX:textX-5}
                    y={isReverse?textY-7:textY-5}
                    width={textWidth + 10}
                    height={textHeight + 8}
                    fill={theme.background}
                    opacity={0.9}
                    cornerRadius={5}
                />
                <Text
                    x={isReverse?textX+5:textX}
                    y={isReverse?textY-1:textY+1}
                    text={edge.label}
                    fontSize={14}
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
})

export default DrawTransitions