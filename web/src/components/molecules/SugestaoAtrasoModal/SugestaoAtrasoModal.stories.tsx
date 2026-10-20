import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SugestaoAtrasoModal } from './SugestaoAtrasoModal';

const meta: Meta<typeof SugestaoAtrasoModal> = {
  title: 'System Design/Molecules/SugestaoAtrasoModal',
  component: SugestaoAtrasoModal,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    obraId: 'obra-demo-123',
    etapa: {
      id: 'etapa-1',
      codigoEap: '1.2.1',
      nome: 'Execução de Alvenaria Estrutural',
    },
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SugestaoAtrasoModal>;

export const Default: Story = {};

export const SemCodigo: Story = {
  args: {
    etapa: {
      id: 'etapa-2',
      nome: 'Instalação de Esquadrias de Alumínio',
    },
  },
};
