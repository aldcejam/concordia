import type { Meta, StoryObj } from '@storybook/react-vite';
import { resumoImportacaoFixture, resumoInvalidoFixture } from '@/system-design/importacaoFixtures';
import { ImportPreviewPanel } from './ImportPreviewPanel';

const meta = {
  title: 'System Design/Organisms/ImportPreviewPanel',
  component: ImportPreviewPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Pré-visualização do UC01: resumo, pesos, avisos e relatório de erros de parsing.',
      },
    },
  },
  args: { resumo: resumoImportacaoFixture, fileName: 'orcamento_analitico.xlsx' },
} satisfies Meta<typeof ImportPreviewPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Valid: Story = {};
export const InvalidSpreadsheet: Story = { args: { resumo: resumoInvalidoFixture, fileName: 'orcamento.xlsx' } };
