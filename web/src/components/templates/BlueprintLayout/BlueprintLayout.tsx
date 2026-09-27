import React from 'react';

export interface BlueprintLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  floatingAction?: React.ReactNode;
  drawer?: React.ReactNode;
  className?: string;
}

export const BlueprintLayout: React.FC<BlueprintLayoutProps> = ({
  header,
  children,
  floatingAction,
  drawer,
  className = '',
}) => {
  return (
    <div className={`blueprint-grid min-h-screen bg-background text-foreground flex flex-col relative ${className}`}>
      {/* Slot de Cabeçalho Sticky */}
      {header && <div className="w-full shrink-0">{header}</div>}

      {/* Conteúdo Principal Responsivo */}
      <main className="flex-1 w-full relative">
        {children}
      </main>

      {/* Slot de Ação Flutuante */}
      {floatingAction && (
        <div className="fixed bottom-6 right-5 z-30">
          {floatingAction}
        </div>
      )}

      {/* Slot de Drawer / Painel Lateral */}
      {drawer}
    </div>
  );
};

BlueprintLayout.displayName = 'BlueprintLayout';
