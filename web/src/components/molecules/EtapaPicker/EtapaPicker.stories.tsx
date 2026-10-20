import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { etapasDependenciasFixture } from '@/system-design/importacaoFixtures';
import { EtapaPicker, type EtapaOption } from './EtapaPicker';

const etapas: EtapaOption[] = etapasDependenciasFixture.map((etapa) => ({
  id: etapa.id!,
  codigoEap: etapa.codigoEap,
  nome: etapa.nome,
  macroetapa: etapa.macroetapa,
}));

const meta = {
  title: 'System Design/Molecules/EtapaPicker',
  component: EtapaPicker,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="min-h-[360px] max-w-xl"><Story /></div>],
  args: { etapas, value: null, onChange: fn(), label: 'Etapa predecessora' },
} satisfies Meta<typeof EtapaPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Selected: Story = { args: { value: 'etapa-fundacao' } };
export const Disabled: Story = { args: { disabled: true } };
function InteractivePicker(args: React.ComponentProps<typeof EtapaPicker>) {
  const [value, setValue] = useState<string | null>(null);
  return <EtapaPicker {...args} value={value} onChange={setValue} />;
}

export const Interactive: Story = {
  render: (args) => <InteractivePicker {...args} />,
};
