import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { InlineAlert } from './InlineAlert';

const meta = {
  title: 'System Design/Atoms/InlineAlert',
  component: InlineAlert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Feedback contextual de erro, aviso, sucesso ou informação. Erros usam `role="alert"`.',
      },
    },
  },
  args: {
    title: 'Planilha validada',
    children: '160 composições encontradas em 15 macroetapas.',
  },
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
  },
} satisfies Meta<typeof InlineAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { variant: 'info' } };
export const Success: Story = { args: { variant: 'success' } };
export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Composições próprias',
    children: '84 itens foram cadastrados como composição própria (sem código de banco oficial).',
  },
};
export const ErrorState: Story = {
  args: {
    variant: 'error',
    title: 'Vínculo recusado',
    children: 'Criaria um ciclo na EAP (1.1.3 → 1.1.1 → 1.1.2 → 1.1.3).',
  },
};
export const Dismissible: Story = {
  args: { variant: 'success', onDismiss: fn() },
  play: async ({ args, canvas }) => {
    await canvas.getByRole('button', { name: /Fechar mensagem/i }).click();
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};
