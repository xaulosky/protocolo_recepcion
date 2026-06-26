interface ChipsProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

/** Fila de chips de filtro (categorías, marcas, etc.). */
export function Chips({ options, value, onChange }: ChipsProps) {
  return (
    <div className="chips-row">
      {options.map((opt) => (
        <button
          key={opt}
          className={`chip${opt === value ? ' active' : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
