import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { resumoImportacaoFixture } from '@/system-design/importacaoFixtures';
import { EapTree } from './EapTree';

const meta = {
  title: 'System Design/Organisms/EapTree',
  component: EapTree,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Árvore da EAP importada, com valor e peso percentual de cada macroetapa, subetapa e item.',
      },
    },
  },
  args: { nodes: resumoImportacaoFixture.eap ?? [] },
} satisfies Meta<typeof EapTree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};
export const Expanded: Story = {
  args: { defaultExpanded: ['1', '1.1'] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('1.1.1')).toBeVisible();
  },
};
export const Empty: Story = { args: { nodes: [] } };
