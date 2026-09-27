import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Slider } from './Slider';

const meta = {
  title: 'System Design/Atoms/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Controle tátil para atualização rápida do percentual executado em campo.',
      },
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Measurement: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <div className="w-80 space-y-2">
        <div className="flex justify-between font-mono text-xs text-muted-foreground">
          <span>EXECUTADO</span>
          <strong className="text-primary">{value[0]}%</strong>
        </div>
        <Slider {...args} value={value} onValueChange={setValue} />
      </div>
    );
  },
  args: {
    value: [65],
    onValueChange: fn(),
    min: 0,
    max: 100,
    step: 5,
    'aria-label': 'Percentual executado da etapa',
  },
};
