import { ArrowRight, Save } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { TactileButton, type TactileButtonVariant } from './TactileButton';

const meta = {
  title: 'System Design/Atoms/TactileButton',
  component: TactileButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Botão com feedback de profundidade para ações de obra e interações primárias.',
      },
    },
  },
  args: {
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'action', 'outline', 'secondary', 'ghost', 'destructive', 'gold'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof TactileButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants: TactileButtonVariant[] = [
  'primary',
  'action',
  'outline',
  'secondary',
  'ghost',
  'destructive',
  'gold',
];

export const Primary: Story = {
  args: {
    children: 'Salvar medição',
    leftIcon: <Save size={16} />,
  },
  play: async ({ args, canvas }) => {
    await canvas.getByRole('button', { name: /Salvar medição/i }).click();
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const Loading: Story = {
  args: {
    children: 'Salvando...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Indisponível',
    disabled: true,
  },
};

export const VariantGallery: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {variants.map((variant) => (
        <TactileButton key={variant} variant={variant} onClick={fn()} rightIcon={<ArrowRight size={15} />}>
          {variant}
        </TactileButton>
      ))}
    </div>
  ),
};
