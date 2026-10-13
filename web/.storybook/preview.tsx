import type { Preview } from '@storybook/react-vite';
import '../src/styles.css';

const preview: Preview = {
  initialGlobals: {
    theme: 'light',
  },
  globalTypes: {
    theme: {
      description: 'Tema visual do Concordia',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Claro' },
          { value: 'dark', title: 'Escuro' },
        ],
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'error' },
  },
  decorators: [
    (Story, context) => (
      <div
        className={context.globals.theme === 'dark' ? 'dark' : ''}
        style={{ minHeight: '100vh' }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
