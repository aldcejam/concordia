import React from 'react';
import { TimelineNodeData } from '@/types/timeline';
import { TactileNode } from '@/components/atoms/TactileNode';
import { StatusBadge, StatusBadgeVariant } from '@/components/atoms/StatusBadge';
import { StagePopover } from '@/components/molecules/StagePopover';

export interface TimelineNodeItemProps {
  node: TimelineNodeData;
  isSelected?: boolean;
  isPopoverOpen?: boolean;
  onSelect?: (node: TimelineNodeData) => void;
  onSelectNode?: (node: TimelineNodeData) => void; // Compatibilidade com PROJECT.md
  onOpenDetails?: (node: TimelineNodeData) => void;
  onTogglePopover?: (node: TimelineNodeData) => void;
  onClosePopover?: () => void;
  className?: string;
}

export const TimelineNodeItem: React.FC<TimelineNodeItemProps> = ({
  node,
  isSelected = false,
  isPopoverOpen = false,
  onSelect,
  onSelectNode,
  onOpenDetails,
  onTogglePopover,
  onClosePopover,
  className = '',
}) => {
  const handleSelect = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onTogglePopover) {
      onTogglePopover(node);
    } else {
      (onSelect ?? onSelectNode)?.(node);
    }
  };

  const handleClosePopover = () => {
    onClosePopover?.();
  };

  const handleOpenDetails = (targetNode: TimelineNodeData | any) => {
    onClosePopover?.();
    onOpenDetails?.(targetNode);
  };

  const isInProgress = node.status === 'in_progress';
  const isAccelerate = node.status === 'accelerate';
  const isDelayed = node.status === 'delayed';

  // Subtítulo estilizado conforme o estado operacional
  const getSubtitleColor = () => {
    if (isDelayed) return 'text-warning';
    if (isAccelerate) return 'text-action-deep';
    return 'text-muted-foreground';
  };

  // Renderização condicional do Badge de status superior
  const renderBadge = () => {
    if (node.badge) {
      if (typeof node.badge === 'string') {
        const badgeVariant: StatusBadgeVariant = isAccelerate
          ? 'accelerate'
          : isInProgress
          ? 'in_progress'
          : isDelayed
          ? 'delayed'
          : 'primary';
        return (
          <StatusBadge
            variant={badgeVariant}
            label={node.badge}
            floating={isAccelerate}
            className="mb-3"
          />
        );
      }
      return (
        <StatusBadge
          variant={node.badge.variant}
          label={node.badge.text}
          floating={node.badge.variant === 'gold' || isAccelerate}
          className="mb-3"
        />
      );
    }

    if (isInProgress) {
      return <StatusBadge variant="in_progress" className="mb-3" />;
    }

    if (isAccelerate) {
      return <StatusBadge variant="accelerate" floating className="mb-3" />;
    }

    return null;
  };

  const buttonElement = (
    <button
      type="button"
      onClick={handleSelect}
      aria-haspopup="dialog"
      aria-expanded={isPopoverOpen || isSelected}
      aria-label={`Abrir detalhes de ${node.title}: status ${node.status}, ${node.progress}% executado`}
      className="group flex w-44 flex-col items-center select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 sm:w-52"
    >
      {renderBadge()}

      <TactileNode
        status={node.status}
        progress={node.progress}
        isSelected={isSelected || isPopoverOpen}
      />

      <span className="mt-4 max-w-52 text-center text-sm font-extrabold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-base">
        {node.title}
      </span>

      <span
        className={`mt-1 text-center text-[11px] font-semibold sm:text-xs ${getSubtitleColor()}`}
      >
        {node.subtitle}
      </span>
    </button>
  );

  // When popover is NOT open, return single child button to ensure test compatibility with rendered.props.children.props.onClick
  if (!isPopoverOpen) {
    return (
      <div
        className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${className}`}
        style={{ left: node.position.left, top: node.position.top }}
        data-status={node.status}
        data-node-id={node.id}
      >
        {buttonElement}
      </div>
    );
  }

  return (
    <div
      className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{ left: node.position.left, top: node.position.top }}
      data-status={node.status}
      data-node-id={node.id}
    >
      {buttonElement}
      <StagePopover
        stage={node}
        isOpen={isPopoverOpen}
        onClose={handleClosePopover}
        onOpenDetails={handleOpenDetails}
      />
    </div>
  );
};

TimelineNodeItem.displayName = 'TimelineNodeItem';
