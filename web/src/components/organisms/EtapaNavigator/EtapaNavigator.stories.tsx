import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { etapasDependenciasFixture } from '@/system-design/importacaoFixtures';
import { EtapaNavigator } from './EtapaNavigator';

const meta = {
  title: 'System Design/Organisms/EtapaNavigator',
  component: EtapaNavigator,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
  args: { etapas: etapasDependenciasFixture, selectedId: 'etapa-estrutura', onSelect: fn() },
} satisfies Meta<typeof EtapaNavigator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    await canvas.getByRole('button', { name: /8.1.1/ }).click();
    await expect(args.onSelect).toHaveBeenCalledWith('etapa-drenagem');
  },
};
export const NothingSelected: Story = { args: { selectedId: null } };
export const Empty: Story = { args: { etapas: [] } };
