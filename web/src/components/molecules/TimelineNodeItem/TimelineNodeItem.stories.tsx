import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TimelineNodeItem } from './TimelineNodeItem';
import { activeNode, delayedNode } from '@/system-design/fixtures';

const meta = {
  title: 'System Design/Molecules/TimelineNodeItem',
  component: TimelineNodeItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Item posicionado da trilha que combina nó, badge, título, metadados e popover opcional.',
      },
    },
  },
  args: {
    onSelect: fn(),
    onOpenDetails: fn(),
    onTogglePopover: fn(),
    onClosePopover: fn(),
  },
} satisfies Meta<typeof TimelineNodeItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: {
    node: activeNode,
    isSelected: true,
  },
};

export const DelayedWithPopover: Story = {
  args: {
    node: delayedNode,
    isPopoverOpen: true,
  },
};

export const LongDescription: Story = {
  args: {
    node: {
      ...activeNode,
      title: 'FORNECIMENTO E INSTALAÇÃO DE PLACA DE LICENCIAMENTO DE OBRA COM FORMATO RETANGULAR',
      technicalDescription: 'Fornecimento e instalação de placa de licenciamento de obra, com formato retangular 1,20 x 0,80 m, conforme padrão da SEMURB, feita com chapa galvanizada e estrutura de madeira.',
    },
    isPopoverOpen: true,
  },
};
