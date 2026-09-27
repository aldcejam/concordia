import React from 'react';
import { HardHat, Construction, MapPin, Box } from 'lucide-react';
import { DecorationItem, DecorationType } from '@/types/timeline';

export interface SiteDecorationProps {
  decoration?: DecorationItem;
  decorations?: DecorationItem[];
  className?: string;
}

export const SiteDecoration: React.FC<SiteDecorationProps> = ({
  decoration,
  decorations,
  className = '',
}) => {
  const itemsToRender = decoration ? [decoration] : decorations ?? [];

  const renderSingleDecoration = (item: DecorationItem) => {
    const { id, type, position, title, subtitle, customTitle, customText } = item;
    const resolvedTitle = customTitle ?? title;
    const resolvedSubtitle = customText ?? subtitle;

    const stylePosition: React.CSSProperties = {
      position: 'absolute',
      top: position.top,
      ...(position.left ? { left: position.left } : {}),
      ...(position.right ? { right: position.right } : {}),
    };

    switch (type as DecorationType) {
      case 'epi-sign':
      case 'epi':
        return (
          <div
            key={id}
            style={stylePosition}
            className="w-36 rotate-[-2deg] border-2 border-action bg-card p-2 text-center shadow-sm select-none"
          >
            <HardHat className="mx-auto mb-1 size-6 text-action" />
            <p className="font-mono text-[9px] font-bold text-action-deep">
              {resolvedTitle || 'ATENÇÃO'}
            </p>
            <p className="text-[10px] font-bold text-foreground">
              {resolvedSubtitle || 'USO DE EPI'}
            </p>
          </div>
        );

      case 'front-office':
      case 'front':
        return (
          <div
            key={id}
            style={stylePosition}
            className="w-40 border-2 border-primary bg-card p-2 shadow-sm select-none"
          >
            <p className="font-mono text-[9px] text-primary">
              {resolvedTitle || 'CONCORDIA • OBRAS'}
            </p>
            <p className="mt-1 text-xs font-extrabold text-foreground">
              {resolvedSubtitle || 'FRENTE DE SERVIÇO 02'}
            </p>
          </div>
        );

      case 'support-zone':
      case 'support':
        return (
          <div
            key={id}
            style={stylePosition}
            className="flex items-end gap-2 text-concrete select-none"
          >
            <Construction className="size-11 shrink-0" />
            <div className="h-14 w-24 border-2 border-concrete bg-muted">
              <div className="mt-2 border-y border-concrete py-1 text-center font-mono text-[8px]">
                {resolvedTitle || 'APOIO'}
              </div>
            </div>
          </div>
        );

      case 'survey-pin':
      case 'landmark':
        return (
          <div
            key={id}
            style={stylePosition}
            className="text-primary select-none"
          >
            <MapPin className="size-11" />
            <div className="ml-5 h-20 w-px bg-primary" />
          </div>
        );

      case 'material-pallets':
      case 'materials':
        return (
          <div
            key={id}
            style={stylePosition}
            className="grid grid-cols-3 gap-1 text-action select-none"
          >
            <Box className="size-7" />
            <Box className="size-7" />
            <Box className="size-7" />
            <Box className="size-7" />
            <Box className="size-7" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`pointer-events-none absolute inset-0 hidden lg:block ${className}`}
      aria-hidden="true"
    >
      {itemsToRender.map(renderSingleDecoration)}
    </div>
  );
};

SiteDecoration.displayName = 'SiteDecoration';
