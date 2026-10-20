import React, { useId, useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { controlClasses } from '@/components/atoms/TextInput/TextInput';

export interface EtapaOption {
  id: string;
  codigoEap?: string;
  nome?: string;
  macroetapa?: string;
}

export interface EtapaPickerProps {
  etapas: EtapaOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  label?: string;
  placeholder?: string;
  maxResults?: number;
  disabled?: boolean;
  className?: string;
}

const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Busca e seleção de uma etapa por código EAP, nome ou macroetapa (combobox acessível). */
export const EtapaPicker: React.FC<EtapaPickerProps> = ({
  etapas,
  value,
  onChange,
  label = 'Etapa',
  placeholder = 'Buscar por código ou nome (ex.: 3.1 ou fundação)',
  maxResults = 8,
  disabled = false,
  className,
}) => {
  const id = useId();
  const listId = `${id}-list`;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = etapas.find((etapa) => etapa.id === value) ?? null;

  const results = useMemo(() => {
    const term = normalize(query.trim());
    const filtered = term
      ? etapas.filter((etapa) =>
          normalize(`${etapa.codigoEap ?? ''} ${etapa.nome ?? ''} ${etapa.macroetapa ?? ''}`).includes(term),
        )
      : etapas;
    return filtered.slice(0, maxResults);
  }, [etapas, query, maxResults]);

  const choose = (option: EtapaOption) => {
    onChange(option.id);
    setQuery('');
    setOpen(false);
  };

  const inputValue = open || !selected ? query : `${selected.codigoEap ?? ''} · ${selected.nome ?? ''}`;

  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute left-3 top-6 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `${listId}-${results[active].id}` : undefined}
        autoComplete="off"
        disabled={disabled}
        value={inputValue}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setActive(0);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActive(0);
          if (value) onChange(null);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            setActive((current) => Math.min(current + 1, results.length - 1));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((current) => Math.max(current - 1, 0));
          } else if (event.key === 'Enter' && open && results[active]) {
            event.preventDefault();
            choose(results[active]);
          } else if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
        className={cn(controlClasses, 'border-input pl-9 hover:border-primary/40')}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-popover mt-1 max-h-72 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-2xl"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">Nenhuma etapa encontrada.</li>
          ) : (
            results.map((option, index) => (
              <li
                key={option.id}
                id={`${listId}-${option.id}`}
                role="option"
                aria-selected={option.id === value}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
                onMouseEnter={() => setActive(index)}
                className={cn(
                  'flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2',
                  index === active ? 'bg-primary/10' : 'hover:bg-muted',
                )}
              >
                <span className="mt-0.5 w-14 shrink-0 font-mono text-xs font-bold text-primary">{option.codigoEap}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-foreground">{option.nome}</span>
                  {option.macroetapa && (
                    <span className="block truncate text-[11px] text-muted-foreground">{option.macroetapa}</span>
                  )}
                </span>
                {option.id === value && <Check className="mt-0.5 size-4 text-primary" aria-hidden />}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

EtapaPicker.displayName = 'EtapaPicker';
