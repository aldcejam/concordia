import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { dependenciasFixture } from '@/system-design/importacaoFixtures';
import { DependencyTable } from './DependencyTable';

const meta = {
  title: 'System Design/Organisms/DependencyTable',
  component: DependencyTable,
  tags: ['autodocs'],
  args: { dependencias: dependenciasFixture, onRemove: fn(), onSelectEtapa: fn() },
} satisfies Meta<typeof DependencyTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Removing: Story = { args: { removingId: 'dep-2' } };
export const ReadOnly: Story = { args: { onRemove: undefined } };
export const Empty: Story = { args: { dependencias: [] } };
