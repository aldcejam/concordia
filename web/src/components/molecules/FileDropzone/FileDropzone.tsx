import React, { useId, useRef, useState } from 'react';
import { FileSpreadsheet, Loader2, UploadCloud, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/format';

export interface FileDropzoneProps {
  /** Extensões aceitas, ex.: ['.xlsx', '.xls']. */
  accept: string[];
  file?: File | null;
  onFileSelected: (file: File) => void;
  onClear?: () => void;
  /** Chamado quando o usuário solta um arquivo com extensão não aceita. */
  onRejected?: (file: File) => void;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  title?: string;
  description?: string;
  /** Versão reduzida, usada quando um arquivo já foi processado e o usuário só pode trocá-lo. */
  compact?: boolean;
  className?: string;
}

/** Área de arrastar e soltar (ou clicar) para enviar um único arquivo. */
export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  file,
  onFileSelected,
  onClear,
  onRejected,
  loading = false,
  loadingLabel = 'Processando arquivo…',
  disabled = false,
  title = 'Arraste a planilha aqui',
  description,
  compact = false,
  className,
}) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const isDisabled = disabled || loading;

  const accepts = (candidate: File) => accept.some((ext) => candidate.name.toLowerCase().endsWith(ext.toLowerCase()));

  const handleFiles = (files: FileList | null) => {
    const selected = files?.[0];
    if (!selected) return;
    if (accepts(selected)) {
      onFileSelected(selected);
    } else {
      onRejected?.(selected);
    }
  };

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isDisabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!isDisabled) handleFiles(event.dataTransfer.files);
        }}
        data-dragging={dragging || undefined}
        className={cn(
          'flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed bg-card/80 text-center transition-all duration-standard',
          compact ? 'min-h-16 flex-row gap-3 p-3' : 'min-h-[220px] flex-col gap-3 p-8',
          'focus-within:ring-2 focus-within:ring-ring',
          dragging ? 'scale-[1.01] border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-primary/5',
          isDisabled && 'pointer-events-none opacity-60',
        )}
      >
        <span
          className={cn(
            'grid place-items-center rounded-2xl border border-primary-deep bg-primary text-primary-foreground shadow-tactile',
            compact ? 'size-10' : 'size-16',
            dragging && 'animate-bounce motion-reduce:animate-none',
          )}
        >
          {loading ? (
            <Loader2 className={cn('animate-spin', compact ? 'size-5' : 'size-8')} />
          ) : (
            <UploadCloud className={compact ? 'size-5' : 'size-8'} />
          )}
        </span>
        <span className={cn('font-extrabold text-foreground', compact ? 'text-sm' : 'text-lg')}>
          {loading ? loadingLabel : compact ? 'Trocar planilha' : title}
        </span>
        <span className={cn('max-w-md text-sm text-muted-foreground', compact && 'hidden sm:inline')}>
          {description ?? (
            <>
              ou <span className="font-bold text-primary underline underline-offset-2">clique para escolher</span> um
              arquivo {accept.join(' ou ')}
            </>
          )}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept.join(',')}
          disabled={isDisabled}
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </label>

      {file && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <FileSpreadsheet className="size-6 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{file.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          {onClear && !loading && (
            <button
              type="button"
              onClick={onClear}
              aria-label={`Remover arquivo ${file.name}`}
              className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors duration-fast hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

FileDropzone.displayName = 'FileDropzone';
