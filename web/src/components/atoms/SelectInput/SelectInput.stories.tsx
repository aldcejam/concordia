import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SelectInput } from './SelectInput';

const meta = {
  title: 'System Design/Atoms/SelectInput',
  component: SelectInput,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Tipo de dependência',
    onChange: fn(),
    options: [
      { value: 'FI', label: 'FI · Fim → Início' },
      { value: 'II', label: 'II · Início → Início' },
      { value: 'FF', label: 'FF · Fim → Fim' },
    ],
  },
  decorators: [(Story) => <div className="max-w-xs"><Story /></div>],
} satisfies Meta<typeof SelectInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = { args: { disabled: true } };
