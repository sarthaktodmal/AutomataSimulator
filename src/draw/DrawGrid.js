import { Line } from "react-konva";
import React from 'react'

const DrawGrid = ({size, color,stageProps}) => {
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
export default DrawGrid;