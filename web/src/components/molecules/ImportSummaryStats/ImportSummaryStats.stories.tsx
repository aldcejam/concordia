import type { Meta, StoryObj } from '@storybook/react-vite';
import { resumoImportacaoFixture } from '@/system-design/importacaoFixtures';
import { ImportSummaryStats } from './ImportSummaryStats';

const meta = {
  title: 'System Design/Molecules/ImportSummaryStats',
  component: ImportSummaryStats,
  tags: ['autodocs'],
  args: { resumo: resumoImportacaoFixture },
} satisfies Meta<typeof ImportSummaryStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutBdi: Story = { args: { resumo: { ...resumoImportacaoFixture, percentualBdi: null } } };
export const Empty: Story = { args: { resumo: {} } };
