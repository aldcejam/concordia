import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepIndicator } from './StepIndicator';

const meta = {
  title: 'System Design/Molecules/StepIndicator',
  component: StepIndicator,
  tags: ['autodocs'],
  args: { steps: ['Enviar planilha', 'Revisar EAP', 'Trilha gerada'], current: 0 },
} satisfies Meta<typeof StepIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {};
export const Reviewing: Story = { args: { current: 1 } };
export const Finished: Story = { args: { current: 2 } };
