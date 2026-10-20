import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextInput } from './TextInput';

const meta = {
  title: 'System Design/Atoms/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  args: { placeholder: 'Descrição da obra', 'aria-label': 'Descrição da obra' },
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: 'ESCOLA MULTICAMPI - INFRAESTRUTURA' } };
export const Invalid: Story = { args: { invalid: true, defaultValue: '' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Somente leitura' } };
export const NumberField: Story = { args: { type: 'number', defaultValue: 0, 'aria-label': 'Desfasamento em dias' } };
