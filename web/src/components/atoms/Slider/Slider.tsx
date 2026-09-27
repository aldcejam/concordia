import React from 'react';

export interface SliderProps {
  value: number[];
  onValueChange: (val: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  'aria-label'?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
  'aria-label': ariaLabel = 'Percentual executado',
}) => {
  const currentVal = value[0] ?? 0;
  const percentage = Math.min(100, Math.max(0, ((currentVal - min) / (max - min)) * 100));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    onValueChange([newVal]);
  };

  return (
    <div className={`relative flex w-full touch-none select-none items-center py-2 ${className}`}>
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
        <div
          className="absolute h-full bg-primary transition-all duration-100"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentVal}
        onChange={handleChange}
        aria-label={ariaLabel}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <div
        className="pointer-events-none absolute block size-4 -translate-x-1/2 rounded-full border border-primary/50 bg-background shadow transition-colors"
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
};

Slider.displayName = 'Slider';
