export interface ThemeToken {
  name: string;
  variable: string;
  utility: string;
  category: 'surface' | 'brand' | 'signal' | 'elevation';
  description: string;
}

export interface SystemScale {
  name: string;
  value: string;
  usage: string;
}

export const systemScales: Record<string, SystemScale[]> = {
  layout: [
    { name: 'Base', value: '4px', usage: 'Unidade mínima de espaçamento; use a escala Tailwind.' },
    { name: 'Section', value: '24–40px', usage: 'Separação entre blocos da tela.' },
    { name: 'Content', value: 'max-w-6xl', usage: 'Largura de leitura e composição do produto.' },
  ],
  interaction: [
    { name: 'Touch', value: '48px', usage: 'Altura mínima para ações de campo em toque.' },
    { name: 'Focus', value: 'ring-2', usage: 'Foco visível em todo elemento interativo.' },
    { name: 'Radius', value: '0.5rem', usage: 'Raio base; use rounded-full apenas em nós e badges.' },
  ],
  motion: [
    { name: 'Fast', value: '150ms', usage: 'Feedback de botão e interação direta.' },
    { name: 'Standard', value: '220ms', usage: 'Transições de componentes e drawers.' },
    { name: 'Reduced', value: 'prefers-reduced-motion', usage: 'Desativa animações contínuas quando solicitado.' },
  ],
  elevation: [
    { name: 'Surface', value: 'shadow-sm', usage: 'Cards e superfícies de leitura.' },
    { name: 'Tactile', value: 'shadow-tactile', usage: 'Botões e nós com profundidade de campo.' },
    { name: 'Overlay', value: 'shadow-2xl', usage: 'Popovers e drawer sobre o conteúdo.' },
  ],
};

export const themeTokens: ThemeToken[] = [
  {
    name: 'Primary',
    variable: '--primary',
    utility: 'bg-primary',
    category: 'brand',
    description: 'Verde de progresso, navegação e estado concluído.',
  },
  {
    name: 'Action',
    variable: '--action',
    utility: 'bg-action',
    category: 'signal',
    description: 'Terracota para ações de campo e chamadas de atenção.',
  },
  {
    name: 'Gold',
    variable: '--gold',
    utility: 'bg-gold',
    category: 'signal',
    description: 'Dourado para oportunidades de adiantamento e marcos.',
  },
  {
    name: 'Warning',
    variable: '--warning',
    utility: 'bg-warning',
    category: 'signal',
    description: 'Alerta operacional para atrasos e impedimentos.',
  },
  {
    name: 'Background',
    variable: '--background',
    utility: 'bg-background',
    category: 'surface',
    description: 'Base neutra da experiência e da grade blueprint.',
  },
  {
    name: 'Card',
    variable: '--card',
    utility: 'bg-card',
    category: 'surface',
    description: 'Superfície elevada para cards, drawers e popovers.',
  },
  {
    name: 'Muted',
    variable: '--muted',
    utility: 'bg-muted',
    category: 'surface',
    description: 'Superfície secundária para trilhos, campos e metadados.',
  },
  {
    name: 'Concrete',
    variable: '--concrete',
    utility: 'bg-concrete',
    category: 'signal',
    description: 'Cinza concreto usado para etapas bloqueadas e apoio.',
  },
];

export const atomicLevels = [
  {
    level: 'Atoms',
    path: 'components/atoms',
    description: 'Controles visuais e indicadores primitivos.',
  },
  {
    level: 'Molecules',
    path: 'components/molecules',
    description: 'Unidades funcionais compostas por átomos.',
  },
  {
    level: 'Organisms',
    path: 'components/organisms',
    description: 'Seções completas com comportamento de negócio.',
  },
  {
    level: 'Templates',
    path: 'components/templates',
    description: 'Estruturas de página sem dados de domínio.',
  },
] as const;
