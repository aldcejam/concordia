import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { DependencyLinkItem } from './DependencyLinkItem';

const meta = {
  title: 'System Design/Molecules/DependencyLinkItem',
  component: DependencyLinkItem,
  tags: ['autodocs'],
  decorators: [(Story) => <ul className="max-w-xl"><Story /></ul>],
  args: {
    direction: 'predecessora',
    onRemove: fn(),
    vinculo: {
      dependenciaId: 'dep-1',
      etapaId: 'etapa-fundacao',
      codigoEap: '3.1.1',
      nome: 'ESCAVAÇÃO MANUAL PARA BLOCO DE COROAMENTO',
      tipo: 'FI',
      desfasamentoDias: 0,
      obrigatoria: true,
      satisfeita: false,
    },
  },
} satisfies Meta<typeof DependencyLinkItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Waiting: Story = {
  play: async ({ args, canvas }) => {
    await canvas.getByRole('button', { name: /Remover vínculo com 3.1.1/i }).click();
    await expect(args.onRemove).toHaveBeenCalledWith('dep-1');
  },
};
export const Released: Story = { args: { vinculo: { ...meta.args.vinculo, satisfeita: true } } };
export const StartStartWithLag: Story = {
  args: { vinculo: { ...meta.args.vinculo, tipo: 'II', desfasamentoDias: 3, obrigatoria: false } },
};
export const Successor: Story = { args: { direction: 'sucessora' } };
export const Removing: Story = { args: { removing: true } };
export const ReadOnly: Story = { args: { onRemove: undefined } };
