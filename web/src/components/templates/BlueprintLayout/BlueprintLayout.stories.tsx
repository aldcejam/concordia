import { HardHat, MapPin } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TactileButton } from '@/components/atoms/TactileButton';
import { BlueprintLayout } from './BlueprintLayout';

const meta = {
  title: 'System Design/Templates/BlueprintLayout',
  component: BlueprintLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Template estrutural com grade blueprint, slots de cabeçalho, ação flutuante e drawer.',
      },
    },
  },
} satisfies Meta<typeof BlueprintLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComposedPage: Story = {
  args: {
    children: null,
  },
  render: () => (
    <BlueprintLayout
      header={
        <header className="flex items-center gap-3 border-b border-border bg-card/90 px-6 py-4 shadow-sm">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-tactile"><HardHat size={18} /></div>
          <div><p className="font-extrabold text-foreground">Residencial Vista Verde</p><p className="font-mono text-xs text-muted-foreground">OBRA CV-0248</p></div>
        </header>
      }
      floatingAction={<TactileButton variant="action" leftIcon={<MapPin size={16} />}>Registrar campo</TactileButton>}
    >
      <div className="mx-auto flex min-h-[32rem] max-w-4xl items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-3 rounded-xl border border-border bg-card/90 p-8 shadow-lg">
          <p className="font-mono text-xs font-bold tracking-widest text-primary">TEMPLATE</p>
          <h1 className="text-2xl font-extrabold text-foreground">Conteúdo da trilha entra aqui</h1>
          <p className="text-sm text-muted-foreground">BlueprintLayout mantém a estrutura; a página injeta dados e organismos.</p>
        </div>
      </div>
    </BlueprintLayout>
  ),
};
