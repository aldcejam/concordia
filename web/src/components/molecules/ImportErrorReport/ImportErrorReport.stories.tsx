import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImportErrorReport } from './ImportErrorReport';

const meta = {
  title: 'System Design/Molecules/ImportErrorReport',
  component: ImportErrorReport,
  tags: ['autodocs'],
  args: {
    erros: [
      { linha: 17, coluna: 'H', mensagem: 'Item 1.1.1: quantidade "4,5O" não é um número válido.' },
      { linha: 31, coluna: 'G', mensagem: 'Item 1.1.2 sem unidade.' },
      { linha: null, coluna: null, mensagem: 'Nenhum item de serviço foi encontrado na planilha.' },
    ],
  },
} satisfies Meta<typeof ImportErrorReport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithErrors: Story = {};
export const SingleError: Story = {
  args: {
    erros: [{ linha: 4, coluna: null, mensagem: 'Colunas obrigatórias ausentes: Unidade, Quantidade.' }],
  },
};
export const Truncated: Story = {
  args: {
    maxVisible: 3,
    erros: Array.from({ length: 8 }, (_, i) => ({
      linha: 10 + i,
      coluna: 'J',
      mensagem: `Item 2.${i + 1}: preço total "R$ -" não é um número válido.`,
    })),
  },
};
export const NoErrors: Story = { args: { erros: [] } };
