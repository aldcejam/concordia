import React, { useMemo } from 'react';
import { Stage } from '@/types/timeline';

export interface SnakePathProps {
  stages: Stage[];
}

export const SnakePath: React.FC<SnakePathProps> = ({ stages }) => {
  const progress = stages.length
    ? stages.reduce((total, stage) => total + Math.min(100, Math.max(0, stage.progress)), 0) / stages.length
    : 0;
  const path = useMemo(() => {
    return stages
      .map((stage, index) => {
        const x = stage.x * 8;
        const y = stage.y * 13;
        if (index === 0) return `M ${x} ${y}`;
        const previous = stages[index - 1];
        if (!previous) return `M ${x} ${y}`;
        const px = previous.x * 8;
        const py = previous.y * 13;
        const midY = (py + y) / 2;
        return `C ${px} ${midY}, ${x} ${midY}, ${x} ${y}`;
      })
      .join(' ');
  }, [stages]);

  const delayedStage = stages.find((stage) => stage.state === 'delayed');
  const boostStage = stages.find((stage) => stage.state === 'boost');
  const boost =
    delayedStage && boostStage
      ? `M ${delayedStage.x * 8} ${delayedStage.y * 13} C 170 790, 140 825, ${boostStage.x * 8} ${boostStage.y * 13}`
      : '';

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 800 1350"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke="var(--border)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="3 18"
      />
      <path
        d={path}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="8"
        strokeLinecap="round"
        pathLength="100"
        strokeDashoffset="0"
        strokeDasharray={`${progress} ${100 - progress}`}
      />
      {boost && (
        <path
          d={boost}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="8 12"
        />
      )}
    </svg>
  );
};

SnakePath.displayName = 'SnakePath';
