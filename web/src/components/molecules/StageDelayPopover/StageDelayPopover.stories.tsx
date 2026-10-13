import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { StageDelayPopover } from './StageDelayPopover';

const meta = {
  title: 'System Design/Molecules/StageDelayPopover',
  component: StageDelayPopover,
  tags: ['autodocs'],
  args: {
    name: 'Instalação de placa de obra', code: '1.1.1', dates: '15/10/2026 → 20/10/2026',
    completed: false, busy: false, onClose: fn(), onSubmit: fn(), onRetry: fn(),
  },
  decorators: [Story => <div className="w-full max-w-md p-4"><Story /></div>],
} satisfies Meta<typeof StageDelayPopover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const IndicateDelay: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Indicar atraso' }));
    await userEvent.type(canvas.getByLabelText('Previsão de atraso (dias)'), '5');
    await userEvent.type(canvas.getByLabelText('Motivo do atraso'), 'Fornecedor atrasou a entrega');
    await userEvent.click(canvas.getByRole('button', { name: 'Analisar adiantamentos' }));
    await expect(args.onSubmit).toHaveBeenCalledWith('Fornecedor atrasou a entrega', 5);
  },
};
export const Analysing: Story = { args: { busy: true, saved: true } };
export const AnalysisFailed: Story = {
  args: { saved: true, error: 'Não foi possível consultar a IA. Tente novamente.' },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Repetir análise' }));
    await expect(args.onRetry).toHaveBeenCalled();
  },
};
export const MissingPlanning: Story = { args: { missingPlanning: 160 }, play: async ({ canvas }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Indicar atraso' }));
  await expect(canvas.getByText(/160 etapa/)).toBeVisible();
  await expect(canvas.getByRole('button', { name: 'Analisar adiantamentos' })).toBeDisabled();
} };
export const Completed: Story = { args: { completed: true } };
