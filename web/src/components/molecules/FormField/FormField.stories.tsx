import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextInput } from '@/components/atoms/TextInput/TextInput';
import { SelectInput } from '@/components/atoms/SelectInput/SelectInput';
import { FormField } from './FormField';

const meta = {
  title: 'System Design/Molecules/FormField',
  component: FormField,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
  args: {
    label: 'Descrição da obra',
    required: true,
    hint: 'Pré-preenchida com o nome encontrado na planilha.',
    children: (props) => <TextInput {...props} defaultValue="COMPLEMENTAÇÃO DE OBRA - INFRAESTRUTURA" />,
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHint: Story = {};
export const WithError: Story = {
  args: {
    error: 'Informe a descrição da obra.',
    children: (props) => <TextInput {...props} defaultValue="" />,
  },
};
export const WithSelect: Story = {
  args: {
    label: 'UF',
    hint: undefined,
    children: (props) => (
      <SelectInput
        {...props}
        options={[
          { value: 'RN', label: 'RN · Rio Grande do Norte' },
          { value: 'PB', label: 'PB · Paraíba' },
        ]}
      />
    ),
  },
};
