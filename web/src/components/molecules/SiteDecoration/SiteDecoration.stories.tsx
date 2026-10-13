import type { Meta, StoryObj } from '@storybook/react-vite';
import { SiteDecoration } from './SiteDecoration';

const meta = {
  title: 'System Design/Molecules/SiteDecoration',
  component: SiteDecoration,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Elementos decorativos do canteiro que reforçam a linguagem blueprint sem capturar interação.',
      },
    },
  },
} satisfies Meta<typeof SiteDecoration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConstructionSite: Story = {
  render: () => <div className="relative h-[520px] bg-background"><SiteDecoration /></div>,
};

export const SafetySign: Story = {
  args: {
    decoration: {
      id: 'safety-sign',
      type: 'epi-sign',
      position: { left: '12%', top: '16%' },
      title: 'ATENÇÃO',
      subtitle: 'USE CAPACETE',
    },
  },
  render: (args) => <div className="relative h-64 bg-background"><SiteDecoration {...args} /></div>,
};
