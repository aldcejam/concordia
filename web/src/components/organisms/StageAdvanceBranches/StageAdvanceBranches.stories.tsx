import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { StageAdvanceBranches, type StageAdvanceBranchesProps } from './StageAdvanceBranches';

const candidates = [
  { id: 'placa', code: '1.1.2', name: 'Placa de licenciamento', justification: 'Frente disponível com equipe própria.' },
  { id: 'ligacao', code: '1.1.3', name: 'Ligação elétrica provisória', justification: 'Permite iniciar a mobilização do canteiro.' },
  { id: 'drenagem', code: '8.1.1', name: 'Drenagem do pórtico', justification: 'Pode iniciar em outra frente da obra.' },
];
const meta = {
  title: 'System Design/Organisms/StageAdvanceBranches',
  component: StageAdvanceBranches,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { candidates, selected: [], onToggle: fn(), onMove: fn(), onPreview: fn(), onConfirm: fn(), onRetry: fn(), onClose: fn() },
  decorators: [Story => <div className="mx-auto max-w-3xl"><Story /></div>],
} satisfies Meta<typeof StageAdvanceBranches>;
export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveBranches(args: StageAdvanceBranchesProps) {
  const [selected, setSelected] = useState(args.selected);
  return <StageAdvanceBranches {...args} selected={selected} onToggle={id => {
    args.onToggle(id); setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }} onMove={(id, direction) => {
    args.onMove(id, direction); setSelected(current => {
      const next = [...current]; const from = next.indexOf(id); const to = from + direction;
      [next[from], next[to]] = [next[to], next[from]]; return next;
    });
  }} />;
}

export const SelectAndOrder: Story = {
  render: args => <InteractiveBranches {...args} />,
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Selecionar 1.1.2 Placa de licenciamento' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Selecionar 8.1.1 Drenagem do pórtico' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Mover 8.1.1 para cima' }));
    await expect(args.onMove).toHaveBeenCalledWith('drenagem', -1);
    await expect(canvas.getByRole('list', { name: 'Ordem das etapas selecionadas' }).children[0]).toHaveTextContent('Drenagem do pórtico');
    await userEvent.click(canvas.getByRole('button', { name: 'Conferir sequência e datas' }));
    await expect(args.onPreview).toHaveBeenCalled();
  },
};
export const DatesPreview: Story = { args: {
  selected: ['drenagem', 'placa'], finishBefore: '30/10/2026', finishAfter: '02/11/2026', changes: [
    { id: 'atrasada', name: '1.1.1 Placa de obra', order: 1, before: '15/10/2026 → 20/10/2026', after: '15/10/2026 → 25/10/2026' },
    { id: 'drenagem', name: '8.1.1 Drenagem do pórtico', order: 2, before: '25/10/2026 → 30/10/2026', after: '13/10/2026 → 18/10/2026' },
    { id: 'placa', name: '1.1.2 Placa de licenciamento', order: 3, before: '20/10/2026 → 23/10/2026', after: '13/10/2026 → 16/10/2026' },
  ],
}, play: async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Confirmar sequência e datas' }));
  await expect(args.onConfirm).toHaveBeenCalled();
} };
export const NoCandidates: Story = { args: { candidates: [] } };
export const Saving: Story = { args: { selected: ['drenagem'], busy: true } };
export const StaleAnalysis: Story = { args: { error: 'O cronograma mudou. Atualize a análise antes de confirmar.' } };
