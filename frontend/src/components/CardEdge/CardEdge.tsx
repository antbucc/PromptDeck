// src/components/CardEdge/CardEdge.tsx

import React, { MouseEvent } from 'react';
import { EdgeProps, getBezierPath } from 'react-flow-renderer';
import { EdgeButton, EdgePath } from './CardEdge.styles';
import closeIcon from '../../assets/close.svg';

const CardEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) => {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (event: MouseEvent<HTMLImageElement>) => {
    event.stopPropagation();
    if (window.confirm('Do you want to delete this edge?')) {
      data.onRemove(id);
    }
  };

  return (
    <>
      <EdgePath id={id} className="react-flow__edge-path" d={edgePath} $status={data?.status} />
      <foreignObject
        width={10}
        height={10}
        x={(sourceX + targetX) / 2 - 8}
        y={(sourceY + targetY) / 2 - 8}
        style={{ overflow: 'visible' }}
      >
        <EdgeButton
          src={closeIcon}
          onClick={onEdgeClick}
          width={10}
          height={10}
        />
      </foreignObject>
    </>
  );
};

export default CardEdge;
