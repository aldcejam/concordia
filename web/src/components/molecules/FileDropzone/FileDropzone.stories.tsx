import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { FileDropzone } from './FileDropzone';

const planilha = new File([new Uint8Array(164978)], 'orcamento_analitico.xlsx', {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
});

const meta = {
  title: 'System Design/Molecules/FileDropzone',
  component: FileDropzone,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Upload de arquivo único por arrastar e soltar ou clique. Valida a extensão antes de enviar.',
      },
    },
  },
  args: {
    accept: ['.xlsx', '.xls'],
    onFileSelected: fn(),
    onRejected: fn(),
    onClear: fn(),
  },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
} satisfies Meta<typeof FileDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const WithFile: Story = { args: { file: planilha } };
export const Loading: Story = { args: { file: planilha, loading: true, loadingLabel: 'Validando planilha…' } };
export const Disabled: Story = { args: { disabled: true } };
export const Compact: Story = { args: { file: planilha, compact: true } };
